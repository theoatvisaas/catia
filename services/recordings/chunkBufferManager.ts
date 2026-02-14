import * as FileSystem from "expo-file-system";
import {
    ensureChunkDir,
    getTempBufferPath,
    getAvailableDiskSpace,
    isDiskSpaceLow,
} from "./chunkStorage";

import { ts } from "@/lib/logger";

const TAG = "[ChunkBuffer]";

type FlushCallback = (data: {
    base64Chunks: string[];
    chunkIndex: number;
    streamPositionStart: number;
}) => void | Promise<void>;

export class ChunkBufferManager {
    private buffer: string[] = [];
    private streamPositionAtBufferStart = 0;
    private currentStreamPosition = 0;
    private chunkIndex = 0;
    private flushThreshold: number;
    private onFlush: FlushCallback;
    private onDiskFull?: () => void;
    private onPersistError?: (error: Error) => void;
    private active = false;
    private persistPending = false;
    private sessionId: string;
    private tempPath: string;
    private pushCount = 0;
    private diskCheckInterval = 10; // check disk every N pushes

    constructor(opts: {
        sessionId: string;
        flushIntervalChunks?: number;
        onFlush: FlushCallback;
        onDiskFull?: () => void;
        onPersistError?: (error: Error) => void;
    }) {
        this.sessionId = opts.sessionId;
        this.flushThreshold = opts.flushIntervalChunks ?? 30;
        this.onFlush = opts.onFlush;
        this.onDiskFull = opts.onDiskFull;
        this.onPersistError = opts.onPersistError;
        this.tempPath = getTempBufferPath(opts.sessionId);
        console.log(`${ts(TAG)} Created | session=${opts.sessionId} | flushEvery=${this.flushThreshold}s | tempPath=${this.tempPath}`);
    }

    /** Returns the path to the temp buffer file for this session. */
    getTempBufferPath(): string {
        return this.tempPath;
    }

    async start(): Promise<void> {
        this.buffer = [];
        this.chunkIndex = 0;
        this.streamPositionAtBufferStart = 0;
        this.currentStreamPosition = 0;
        this.pushCount = 0;
        this.active = true;

        // Ensure the session directory exists BEFORE any write attempt
        console.log(`${ts(TAG)} start() | Creating chunk dir for session ${this.sessionId}`);
        await ensureChunkDir(this.sessionId);
        console.log(`${ts(TAG)} start() | Chunk dir ready`);

        await this.deleteTempFile();
        console.log(`${ts(TAG)} start() | Buffer manager active`);
    }

    /** Called from onAudioStream. Accumulates PCM audio data and persists to disk. */
    push(event: {
        audioData: string;
        position: number;
        eventDataSize: number;
    }): void {
        if (!this.active) return;

        this.buffer.push(event.audioData);
        this.currentStreamPosition = event.position + event.eventDataSize;
        this.pushCount++;

        const b64Len = event.audioData.length;
        const approxBytes = Math.ceil((b64Len * 3) / 4);
        console.log(
            `${ts(TAG)} push #${this.pushCount} | buffer=${this.buffer.length}/${this.flushThreshold} | b64len=${b64Len} (~${approxBytes}B) | streamPos=${this.currentStreamPosition}`
        );

        // Periodic disk space check (not every push, for performance)
        if (this.pushCount % this.diskCheckInterval === 0) {
            this.checkDiskSpace();
        }

        // Persist the full buffer to disk (fire-and-forget, debounced)
        this.persistToDisk();

        if (this.buffer.length >= this.flushThreshold) {
            this.flush();
        }
    }

    /** Force-flush whatever is in the buffer (called on recording end). */
    async flushRemaining(): Promise<void> {
        if (this.buffer.length > 0) {
            console.log(`${ts(TAG)} flushRemaining() | ${this.buffer.length} items in buffer`);
            await this.flush();
        } else {
            console.log(`${ts(TAG)} flushRemaining() | buffer empty, nothing to flush`);
        }
    }

    stop(): void {
        console.log(`${ts(TAG)} stop() | pushCount=${this.pushCount} | chunkIndex=${this.chunkIndex}`);
        this.active = false;
    }

    async reset(): Promise<void> {
        console.log(`${ts(TAG)} reset()`);
        this.buffer = [];
        this.chunkIndex = 0;
        this.streamPositionAtBufferStart = 0;
        this.currentStreamPosition = 0;
        this.pushCount = 0;
        this.active = false;

        await this.deleteTempFile();
    }

    // ── Private ───────────────────────────────────────────

    private async flush(): Promise<void> {
        const totalB64Len = this.buffer.reduce((sum, s) => sum + s.length, 0);
        const approxBytes = Math.ceil((totalB64Len * 3) / 4);

        console.log(
            `${ts(TAG)} FLUSH chunk #${this.chunkIndex} | ${this.buffer.length} items | ~${approxBytes}B | streamStart=${this.streamPositionAtBufferStart}`
        );

        const data = {
            base64Chunks: [...this.buffer],
            chunkIndex: this.chunkIndex,
            streamPositionStart: this.streamPositionAtBufferStart,
        };

        this.chunkIndex++;
        this.buffer = [];
        this.streamPositionAtBufferStart = this.currentStreamPosition;

        await this.onFlush(data);

        // Reset the temp file after a successful flush (fire-and-forget)
        this.deleteTempFile();
    }

    /**
     * Write the entire current buffer to disk as newline-separated base64 strings.
     * Each line is one 1-second PCM chunk in base64.
     * On crash recovery, this file is read, decoded, and uploaded as the final chunk.
     *
     * Uses a simple debounce: if a write is already in flight, skip.
     * Worst case we miss 1 second of data in the temp file, but that's acceptable.
     */
    private persistToDisk(): void {
        if (this.persistPending) return;
        this.persistPending = true;

        const dataToWrite = this.buffer.join("\n");

        // [TEST] Scenario 3: Simulate disk write error after 12s of recording
        if (__DEV__) {
            const { testFlags } = require("@/config/testFlags");
            if (testFlags.failDiskWrite && this.pushCount > 12) {
                if (this.pushCount === 13) {
                    console.log(`[TEST] Simulated: Disk write FAILED at push #${this.pushCount} (after 12s)`);
                }
                Promise.reject(new Error("Simulated disk write error"))
                    .catch((err) => {
                        console.warn(`${ts(TAG)} Failed to persist to disk:`, err);
                        this.onPersistError?.(err instanceof Error ? err : new Error(String(err)));
                    })
                    .finally(() => {
                        this.persistPending = false;
                    });
                return;
            }
        }

        FileSystem.writeAsStringAsync(this.tempPath, dataToWrite, {
            encoding: FileSystem.EncodingType.UTF8,
        })
            .then(() => {
                // Log only every 10 persists to avoid spam
                if (this.pushCount % 10 === 0) {
                    console.log(`${ts(TAG)} persisted ${dataToWrite.length} chars to disk`);
                }
            })
            .catch((err) => {
                console.warn(`${ts(TAG)} Failed to persist to disk:`, err);
                this.onPersistError?.(err instanceof Error ? err : new Error(String(err)));
            })
            .finally(() => {
                this.persistPending = false;
            });
    }

    private checkDiskSpace(): void {
        getAvailableDiskSpace()
            .then((freeBytes) => {
                const freeMB = freeBytes != null ? (freeBytes / 1024 / 1024).toFixed(0) : "?";
                console.log(`${ts(TAG)} Disk check: ${freeMB}MB free`);
                if (isDiskSpaceLow(freeBytes)) {
                    console.warn(`${ts(TAG)} DISK SPACE LOW: ${freeMB}MB`);
                    this.onDiskFull?.();
                }
            })
            .catch(() => {
                // can't check, ignore
            });
    }

    private async deleteTempFile(): Promise<void> {
        try {
            const info = await FileSystem.getInfoAsync(this.tempPath);
            if (info.exists) {
                await FileSystem.deleteAsync(this.tempPath, { idempotent: true });
            }
        } catch {
            // ignore
        }
    }
}
