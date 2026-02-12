import * as FileSystem from "expo-file-system";

/** Path to the temporary buffer file persisted to disk between flushes.
 *  Contains the concatenated base64 PCM data of the current (not yet uploaded) buffer.
 *  Max size: ~1.3MB (30 seconds × ~43KB base64 per second at 16kHz/16bit/mono).
 *  Deleted after each successful flush and recreated for the next buffer window.
 */
export const CHUNK_BUFFER_TEMP_PATH = `${FileSystem.documentDirectory}chunk_buffer_temp.b64`;

type FlushCallback = (data: {
    base64Chunks: string[];
    chunkIndex: number;
    streamPositionStart: number;
}) => void;

export class ChunkBufferManager {
    private buffer: string[] = [];
    private streamPositionAtBufferStart = 0;
    private currentStreamPosition = 0;
    private chunkIndex = 0;
    private flushThreshold: number;
    private onFlush: FlushCallback;
    private active = false;
    private persistPending = false;

    constructor(opts: { flushIntervalChunks?: number; onFlush: FlushCallback }) {
        this.flushThreshold = opts.flushIntervalChunks ?? 30;
        this.onFlush = opts.onFlush;
    }

    async start(): Promise<void> {
        this.buffer = [];
        this.chunkIndex = 0;
        this.streamPositionAtBufferStart = 0;
        this.currentStreamPosition = 0;
        this.active = true;

        await this.deleteTempFile();
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

        // Persist the full buffer to disk (fire-and-forget, debounced)
        this.persistToDisk();

        if (this.buffer.length >= this.flushThreshold) {
            this.flush();
        }
    }

    /** Force-flush whatever is in the buffer (called on recording end). */
    flushRemaining(): void {
        if (this.buffer.length > 0) {
            this.flush();
        }
    }

    stop(): void {
        this.active = false;
    }

    async reset(): Promise<void> {
        this.buffer = [];
        this.chunkIndex = 0;
        this.streamPositionAtBufferStart = 0;
        this.currentStreamPosition = 0;
        this.active = false;

        await this.deleteTempFile();
    }

    // ── Private ───────────────────────────────────────────

    private flush(): void {
        const data = {
            base64Chunks: [...this.buffer],
            chunkIndex: this.chunkIndex,
            streamPositionStart: this.streamPositionAtBufferStart,
        };

        this.chunkIndex++;
        this.buffer = [];
        this.streamPositionAtBufferStart = this.currentStreamPosition;

        this.onFlush(data);

        // Reset the temp file after a successful flush (fire-and-forget)
        this.deleteTempFile();
    }

    /**
     * Write the entire current buffer to disk as a single concatenated base64 string.
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

        FileSystem.writeAsStringAsync(CHUNK_BUFFER_TEMP_PATH, dataToWrite, {
            encoding: FileSystem.EncodingType.UTF8,
        })
            .catch((err) => {
                console.warn("[ChunkBuffer] Failed to persist to disk:", err);
            })
            .finally(() => {
                this.persistPending = false;
            });
    }

    private async deleteTempFile(): Promise<void> {
        try {
            const info = await FileSystem.getInfoAsync(CHUNK_BUFFER_TEMP_PATH);
            if (info.exists) {
                await FileSystem.deleteAsync(CHUNK_BUFFER_TEMP_PATH, { idempotent: true });
            }
        } catch {
            // ignore
        }
    }
}
