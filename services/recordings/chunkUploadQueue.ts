import AsyncStorage from "@react-native-async-storage/async-storage";
import { uploadChunkBase64 } from "./uploadChunkBase64";
import type {
    ChunkMeta,
    ChunkUploadProgress,
    RecordingSessionState,
} from "@/types/chunkTypes";

const SESSION_STORAGE_KEY = "@catia:activeChunkSession";
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 8000];

type QueueItem = {
    base64Chunks: string[];
    chunkIndex: number;
    streamPositionStart: number;
};

type ProgressListener = (progress: ChunkUploadProgress) => void;

export class ChunkUploadQueue {
    private queue: QueueItem[] = [];
    private processing = false;
    private session: RecordingSessionState | null = null;
    private progressListeners = new Set<ProgressListener>();

    // ── Session lifecycle ─────────────────────────────────

    async initSession(params: {
        userId: string;
        sessionId: string;
        patientName: string;
        guardianName: string;
        sex: "male" | "female" | null;
    }): Promise<void> {
        const bucket = process.env.EXPO_PUBLIC_SUPABASE_BUCKET || "recordings";

        this.session = {
            sessionId: params.sessionId,
            userId: params.userId,
            bucket,
            storagePrefix: `${params.userId}/recordings/${params.sessionId}`,
            chunks: [],
            nextChunkIndex: 0,
            startedAt: Date.now(),
            finalized: false,
            patientName: params.patientName,
            guardianName: params.guardianName,
            sex: params.sex,
        };

        await this.persistSession();
    }

    getSession(): RecordingSessionState | null {
        return this.session;
    }

    // ── Queue operations ──────────────────────────────────

    enqueue(data: QueueItem): void {
        this.queue.push(data);
        this.processNext();
    }

    async finalize(params: {
        durationMs: number;
        fullFileStoragePath?: string;
    }): Promise<RecordingSessionState> {
        await this.waitForQueueDrain();

        if (!this.session) throw new Error("No active session to finalize");

        this.session.finalized = true;
        await this.persistSession();

        return { ...this.session };
    }

    async clearSession(): Promise<void> {
        this.session = null;
        this.queue = [];
        this.processing = false;
        await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
    }

    // ── Recovery ──────────────────────────────────────────

    async loadPersistedSession(): Promise<RecordingSessionState | null> {
        const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) return null;

        try {
            return JSON.parse(raw) as RecordingSessionState;
        } catch {
            await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
            return null;
        }
    }

    // ── Progress ──────────────────────────────────────────

    onProgress(listener: ProgressListener): () => void {
        this.progressListeners.add(listener);
        return () => {
            this.progressListeners.delete(listener);
        };
    }

    getProgress(): ChunkUploadProgress {
        if (!this.session) {
            return {
                totalChunks: 0,
                uploadedChunks: 0,
                failedChunks: 0,
                currentlyUploading: false,
            };
        }

        return {
            totalChunks: this.session.chunks.length + this.queue.length,
            uploadedChunks: this.session.chunks.filter((c) => c.status === "uploaded").length,
            failedChunks: this.session.chunks.filter((c) => c.status === "failed").length,
            currentlyUploading: this.processing,
        };
    }

    // ── Internal ──────────────────────────────────────────

    private async processNext(): Promise<void> {
        if (this.processing || this.queue.length === 0 || !this.session) return;

        this.processing = true;
        const item = this.queue.shift()!;

        const chunkMeta: ChunkMeta = {
            index: item.chunkIndex,
            storagePath: `${this.session.storagePrefix}/chunk_${String(item.chunkIndex).padStart(4, "0")}.wav`,
            status: "uploading",
            sizeBytes: 0,
            retryCount: 0,
            streamPosition: item.streamPositionStart,
        };

        // Estimate decoded size from base64 lengths (each string decoded individually)
        const totalBase64Len = item.base64Chunks.reduce((sum, s) => sum + s.length, 0);
        chunkMeta.sizeBytes = Math.ceil((totalBase64Len * 3) / 4);

        let success = false;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                await uploadChunkBase64({
                    base64Chunks: item.base64Chunks,
                    bucket: this.session.bucket,
                    storagePath: chunkMeta.storagePath,
                });

                chunkMeta.status = "uploaded";
                success = true;
                console.log(`[ChunkUpload] Chunk ${item.chunkIndex} uploaded (${chunkMeta.sizeBytes} bytes)`);
                break;
            } catch (err) {
                chunkMeta.retryCount = attempt + 1;
                console.warn(
                    `[ChunkUpload] Chunk ${item.chunkIndex} attempt ${attempt + 1} failed:`,
                    err
                );

                if (attempt < MAX_RETRIES) {
                    await this.delay(RETRY_DELAYS[attempt] ?? 8000);
                }
            }
        }

        if (!success) {
            chunkMeta.status = "failed";
            console.error(
                `[ChunkUpload] Chunk ${item.chunkIndex} permanently failed after ${MAX_RETRIES + 1} attempts`
            );
        }

        this.session.chunks.push(chunkMeta);
        await this.persistSession();
        this.notifyProgress();

        this.processing = false;
        this.processNext();
    }

    private async persistSession(): Promise<void> {
        if (!this.session) return;
        await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.session));
    }

    private notifyProgress(): void {
        const progress = this.getProgress();
        this.progressListeners.forEach((listener) => listener(progress));
    }

    private waitForQueueDrain(): Promise<void> {
        return new Promise((resolve) => {
            const check = () => {
                if (this.queue.length === 0 && !this.processing) {
                    resolve();
                } else {
                    setTimeout(check, 200);
                }
            };
            check();
        });
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

/** Singleton instance */
export const chunkUploadQueue = new ChunkUploadQueue();
