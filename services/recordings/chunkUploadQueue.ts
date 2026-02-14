import { uploadChunkBase64 } from "./uploadChunkBase64";
import { saveChunkLocally, deleteLocalChunk } from "./chunkStorage";
import { ensureValidSession } from "./tokenGuard";
import { getNetworkStatus } from "../network/networkMonitor";

import { ts } from "@/lib/logger";
import { useConsultationStore } from "@/stores/consultation/useConsultationStore";

const TAG = "[ChunkUpload]";

/** Extract a readable message from any error type (Error, plain object, string, etc.) */
function errorMsg(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "object" && err !== null && "message" in err) return String((err as any).message);
    try { return JSON.stringify(err); } catch { return String(err); }
}

type QueueItem = {
    base64Chunks: string[];
    chunkIndex: number;
    order: number;
    streamPositionStart: number;
};

type ProgressListener = (progress: {
    totalChunks: number;
    uploadedChunks: number;
    failedChunks: number;
    currentlyUploading: boolean;
}) => void;

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 8000];
const CONTINUOUS_RETRY_DELAY = 45_000; // 45s between continuous retries during recording

export class ChunkUploadQueue {
    private queue: QueueItem[] = [];
    private processing = false;
    private halted = false;
    private haltReason?: string;
    private progressListeners = new Set<ProgressListener>();
    private sessionId: string | null = null;
    private retryTimerId: ReturnType<typeof setTimeout> | null = null;
    private retryItem: QueueItem | null = null;

    // ── Session lifecycle ─────────────────────────────────

    setSession(sessionId: string): void {
        console.log(`${ts(TAG)} setSession(${sessionId})`);
        this.cancelRetry();
        this.sessionId = sessionId;
        this.queue = [];
        this.processing = false;
        this.halted = false;
        this.haltReason = undefined;
    }

    getSessionId(): string | null {
        return this.sessionId;
    }

    clearSession(): void {
        console.log(`${ts(TAG)} clearSession() | was=${this.sessionId} | queueLen=${this.queue.length} | processing=${this.processing} | halted=${this.halted} | retryPending=${this.retryTimerId !== null}`);
        this.cancelRetry();

        // Save any remaining queued items locally before clearing (must run before sessionId = null)
        const remaining = [...this.queue];
        if (remaining.length > 0) {
            console.log(`${ts(TAG)} clearSession() | Saving ${remaining.length} remaining queued item(s) locally`);
            for (const item of remaining) {
                this.saveLocally(item).catch((err) =>
                    console.warn(`${ts(TAG)} Failed to save remaining item #${item.chunkIndex} locally:`, err)
                );
            }
        }

        this.sessionId = null;
        this.queue = [];
        this.processing = false;
        this.halted = false;
        this.haltReason = undefined;
        console.log(`${ts(TAG)} clearSession() DONE | sessionId=null | processing=false`);
    }

    // ── Queue operations ──────────────────────────────────

    async enqueue(data: QueueItem): Promise<void> {
        const totalB64 = data.base64Chunks.reduce((s, c) => s + c.length, 0);
        console.log(
            `${ts(TAG)} enqueue() | chunk=#${data.chunkIndex} order=${data.order} | ${data.base64Chunks.length} items (~${Math.ceil((totalB64 * 3) / 4)}B) | queueLen=${this.queue.length + 1} | halted=${this.halted}`
        );

        // ALWAYS save locally first — AWAIT to guarantee disk persistence before any upload
        try {
            await this.saveLocally(data);
        } catch (err) {
            console.warn(`${ts(TAG)} Failed to save locally on enqueue:`, err);
        }

        if (this.halted) {
            console.log(`${ts(TAG)} enqueue() | Queue halted — saved locally, not queuing`);
            return;
        }

        if (this.retryTimerId) {
            console.log(`${ts(TAG)} enqueue() | Retry pending — saved locally, queuing for later`);
            this.queue.push(data);
            return;
        }

        this.queue.push(data);
        this.processNext();
    }

    /** Resume uploading from where we stopped (after halt or network restore). */
    resume(): void {
        console.log(`${ts(TAG)} resume() | halted=${this.halted} | queueLen=${this.queue.length}`);
        if (!this.halted) return;
        this.halted = false;
        this.haltReason = undefined;
        this.processNext();
    }

    isHalted(): boolean {
        return this.halted;
    }

    getHaltReason(): string | undefined {
        return this.haltReason;
    }

    // ── Wait for drain ────────────────────────────────────

    waitForDrain(timeoutMs = 30000): Promise<boolean> {
        console.log(`${ts(TAG)} waitForDrain(${timeoutMs}ms) | queueLen=${this.queue.length} | processing=${this.processing}`);
        return new Promise((resolve) => {
            const start = Date.now();

            const check = () => {
                if (this.queue.length === 0 && !this.processing) {
                    console.log(`${ts(TAG)} waitForDrain() → drained OK (${Date.now() - start}ms)`);
                    resolve(true);
                } else if (this.halted || this.retryTimerId !== null) {
                    console.log(`${ts(TAG)} waitForDrain() → ${this.halted ? "halted" : "retry pending"} (${this.haltReason})`);
                    resolve(false);
                } else if (Date.now() - start > timeoutMs) {
                    console.log(`${ts(TAG)} waitForDrain() → timeout (queueLen=${this.queue.length})`);
                    resolve(false);
                } else {
                    setTimeout(check, 200);
                }
            };

            check();
        });
    }

    // ── Progress ──────────────────────────────────────────

    onProgress(listener: ProgressListener): () => void {
        this.progressListeners.add(listener);
        return () => {
            this.progressListeners.delete(listener);
        };
    }

    // ── Continuous retry (during recording) ───────────────

    /**
     * Schedule a retry after CONTINUOUS_RETRY_DELAY (45s).
     * The failed item was already saved locally before this call (crash safety).
     * Re-inserts the item at the front of the queue when the timer fires.
     */
    private scheduleRetry(item: QueueItem, reason: string): void {
        this.retryItem = item;
        this.haltReason = reason;
        console.log(
            `${ts(TAG)} ⏳ Retry scheduled in ${CONTINUOUS_RETRY_DELAY / 1000}s | reason=${reason} | chunk=#${item.chunkIndex}`
        );

        this.retryTimerId = setTimeout(() => {
            this.retryTimerId = null;
            if (!this.sessionId || !this.retryItem) return; // session was cleared

            console.log(
                `${ts(TAG)} ⏳ Retry timer fired | chunk=#${this.retryItem.chunkIndex} | reason=${reason}`
            );

            // Re-insert at front of queue and try again
            this.queue.unshift(this.retryItem);
            this.retryItem = null;
            this.haltReason = undefined;
            this.processNext();
        }, CONTINUOUS_RETRY_DELAY);
    }

    /** Cancel any pending retry timer. Item was already saved locally when retry was scheduled. */
    private cancelRetry(): void {
        if (this.retryTimerId) {
            clearTimeout(this.retryTimerId);
            this.retryTimerId = null;
            console.log(`${ts(TAG)} ⏳ Retry timer cancelled | chunk=#${this.retryItem?.chunkIndex ?? "?"}`);
        }
        this.retryItem = null;
    }

    isRetryPending(): boolean {
        return this.retryTimerId !== null;
    }

    // ── Internal ──────────────────────────────────────────

    private async processNext(): Promise<void> {
        console.log(`${ts(TAG)} processNext() ENTER | processing=${this.processing} | queueLen=${this.queue.length} | sessionId=${this.sessionId} | halted=${this.halted}`);
        if (this.processing || this.queue.length === 0 || !this.sessionId || this.halted) {
            console.log(`${ts(TAG)} processNext() SKIP | processing=${this.processing} | queueEmpty=${this.queue.length === 0} | noSession=${!this.sessionId} | halted=${this.halted}`);
            return;
        }

        this.processing = true;
        const item = this.queue.shift()!;

        // IMPORTANT: Capture sessionId locally so it survives clearSession() calls
        // that may happen while this async method is still running (e.g., finish()
        // calls clearSession() after waitForDrain timeout, but upload is still in-flight).
        const sessionId = this.sessionId;

        const store = useConsultationStore.getState();
        const consultation = store.getConsultation(sessionId);

        if (!consultation) {
            console.warn(`${ts(TAG)} processNext() | No consultation found for session ${sessionId}`);
            this.processing = false;
            return;
        }

        // [TEST] Scenario 9: Simulate duplicate upload (force-mark as uploaded before guard)
        if (__DEV__) {
            const { testFlags } = require("@/config/testFlags");
            if (testFlags.simulateDuplicateUpload) {
                console.log(`[TEST] Force-marking chunk #${item.chunkIndex} as uploaded (duplicate simulation)`);
                store.updateChunkStatus(sessionId, item.chunkIndex, "uploaded", {
                    storagePath: `${consultation.storagePrefix}/chunk_${String(item.chunkIndex).padStart(4, "0")}.wav`,
                    sizeBytes: item.base64Chunks.reduce((s, c) => s + c.length, 0),
                });
                store.recomputeSyncStatus(sessionId);
            }
        }

        // Duplicate guard: skip if already uploaded
        const existingChunk = consultation.chunks.find((c) => c.index === item.chunkIndex);
        if (existingChunk?.status === "uploaded") {
            console.log(`${ts(TAG)} Chunk #${item.chunkIndex} already uploaded, skipping`);
            this.processing = false;
            this.processNext();
            return;
        }

        // Check network — if offline, schedule retry (already saved locally by enqueue)
        const network = getNetworkStatus();
        console.log(`${ts(TAG)} processNext() | chunk=#${item.chunkIndex} | network=${network.isConnected ? network.type : "OFFLINE"}`);

        if (!network.isConnected) {
            console.log(`${ts(TAG)} Offline — scheduling retry for chunk #${item.chunkIndex} (already saved locally)`);
            this.processing = false;
            this.scheduleRetry(item, "No network connection");
            return;
        }

        // Ensure valid auth token
        console.log(`${ts(TAG)} Checking auth session...`);
        const validSession = await ensureValidSession();
        if (!validSession) {
            console.warn(`${ts(TAG)} Auth session invalid — scheduling retry for chunk #${item.chunkIndex} (already saved locally)`);
            this.processing = false;
            this.scheduleRetry(item, "Auth session expired");
            return;
        }
        console.log(`${ts(TAG)} Auth session OK`);

        const storagePath = `${consultation.storagePrefix}/chunk_${String(item.chunkIndex).padStart(4, "0")}.wav`;

        // Estimate size
        const totalBase64Len = item.base64Chunks.reduce((sum, s) => sum + s.length, 0);
        const estimatedSize = Math.ceil((totalBase64Len * 3) / 4);

        // Mark as uploading in store
        store.updateChunkStatus(sessionId, item.chunkIndex, "uploading");
        this.notifyProgress();

        console.log(
            `${ts(TAG)} UPLOADING chunk #${item.chunkIndex} (order=${item.order}) | ~${estimatedSize}B | path=${storagePath}`
        );

        let success = false;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                // [TEST] Scenario 5: Fail upload at specific chunk index
                // [TEST] Scenario 8: Simulate corrupt upload (throw before actual upload)
                if (__DEV__) {
                    const { testFlags } = require("@/config/testFlags");
                    if (testFlags.failChunkAtIndex !== null && item.chunkIndex === testFlags.failChunkAtIndex) {
                        console.log(`[TEST] Simulated: Chunk #${item.chunkIndex} upload FAILED (failChunkAtIndex=${testFlags.failChunkAtIndex})`);
                        throw new Error(`Simulated upload failure at chunk #${item.chunkIndex}`);
                    }
                    if (testFlags.simulateCorruptUpload) {
                        console.log(`[TEST] Simulated: Chunk #${item.chunkIndex} upload returned corrupt (no path)`);
                        throw new Error("Upload returned no path — possible corruption");
                    }
                }

                console.log(`${ts(TAG)} chunk #${item.chunkIndex} attempt ${attempt + 1} | CALLING uploadChunkBase64 | sessionId=${sessionId} | this.sessionId=${this.sessionId} | this.processing=${this.processing}`);
                const t0 = Date.now();
                const result = await uploadChunkBase64({
                    base64Chunks: item.base64Chunks,
                    bucket: consultation.bucket,
                    storagePath,
                });

                const elapsed = Date.now() - t0;
                console.log(`${ts(TAG)} chunk #${item.chunkIndex} attempt ${attempt + 1} | uploadChunkBase64 RETURNED | elapsed=${elapsed}ms | this.sessionId=${this.sessionId} | this.processing=${this.processing}`);

                // Integrity check: verify result path exists
                if (!result?.path) {
                    throw new Error("Upload returned no path — possible corruption");
                }

                // Success — use captured sessionId (survives clearSession())
                store.updateChunkStatus(sessionId, item.chunkIndex, "uploaded", {
                    storagePath,
                    sizeBytes: estimatedSize,
                });
                store.recomputeSyncStatus(sessionId);
                success = true;

                console.log(
                    `${ts(TAG)} ✅ Chunk #${item.chunkIndex} (order=${item.order}) UPLOADED | ${estimatedSize}B | ${elapsed}ms | path=${result.path}`
                );

                // Delete local file — chunk is now safely in Supabase
                const uploadedChunk = store.getConsultation(sessionId)?.chunks.find(c => c.index === item.chunkIndex);
                if (uploadedChunk?.localFilePath) {
                    deleteLocalChunk(uploadedChunk.localFilePath).catch((err) =>
                        console.warn(`${ts(TAG)} Failed to delete local chunk #${item.chunkIndex}:`, err)
                    );
                }
                break;
            } catch (err) {
                const msg = errorMsg(err);
                console.warn(
                    `${ts(TAG)} ❌ Chunk #${item.chunkIndex} attempt ${attempt + 1}/${MAX_RETRIES + 1} FAILED: ${msg}`
                );

                if (attempt < MAX_RETRIES) {
                    const delayMs = RETRY_DELAYS[attempt] ?? 8000;
                    console.log(`${ts(TAG)} Retrying in ${delayMs}ms...`);
                    await this.delay(delayMs);
                }
            }
        }

        if (!success) {
            console.warn(`${ts(TAG)} Chunk #${item.chunkIndex} FAILED after all retries — scheduling continuous retry (already saved locally)`);

            // [TEST] Auto-disable failChunkAtIndex so the 45s retry can succeed
            if (__DEV__) {
                const { testFlags } = require("@/config/testFlags");
                if (testFlags.failChunkAtIndex === item.chunkIndex) {
                    console.log(`[TEST] Auto-disabling failChunkAtIndex (was #${item.chunkIndex}) — next retry will use real upload`);
                    testFlags.failChunkAtIndex = null;
                }
            }

            this.processing = false;
            this.notifyProgress();
            this.scheduleRetry(item, `Chunk ${item.chunkIndex} failed after ${MAX_RETRIES + 1} attempts`);
            return;
        }

        this.notifyProgress();
        this.processing = false;
        this.processNext();
    }

    /**
     * Save chunk locally using the current this.sessionId.
     * Used by enqueue() (always, for crash safety) and clearSession() (safety net).
     */
    private async saveLocally(item: QueueItem): Promise<string | null> {
        if (!this.sessionId) return null;
        return this.saveLocallyForSession(item, this.sessionId);
    }

    /**
     * Save chunk locally using an explicit sessionId.
     * Used by processNext() which captures sessionId at the start to survive clearSession().
     */
    private async saveLocallyForSession(item: QueueItem, sessionId: string): Promise<string | null> {
        try {
            const localPath = await saveChunkLocally(
                sessionId,
                item.chunkIndex,
                item.base64Chunks
            );

            const store = useConsultationStore.getState();
            const consultation = store.getConsultation(sessionId);

            if (consultation) {
                const totalBase64Len = item.base64Chunks.reduce((sum, s) => sum + s.length, 0);
                const estimatedSize = Math.ceil((totalBase64Len * 3) / 4);
                const storagePath = `${consultation.storagePrefix}/chunk_${String(item.chunkIndex).padStart(4, "0")}.wav`;

                // Check if chunk already exists in store
                const existing = consultation.chunks.find((c) => c.index === item.chunkIndex);
                if (!existing) {
                    store.addChunk(sessionId, {
                        index: item.chunkIndex,
                        order: item.order,
                        storagePath,
                        status: "pending_local",
                        sizeBytes: estimatedSize,
                        retryCount: 0,
                        streamPosition: item.streamPositionStart,
                        localFilePath: localPath,
                    });
                } else {
                    store.updateChunkStatus(sessionId, item.chunkIndex, "pending_local", {
                        localFilePath: localPath,
                    });
                }
                store.recomputeSyncStatus(sessionId);
            }

            console.log(`${ts(TAG)} 💾 Chunk #${item.chunkIndex} saved locally: ${localPath}`);
            return localPath;
        } catch (err) {
            console.error(`${ts(TAG)} Failed to save chunk #${item.chunkIndex} locally:`, err);
            return null;
        }
    }

    private halt(reason: string): void {
        this.halted = true;
        this.haltReason = reason;
        console.warn(`${ts(TAG)} ⛔ QUEUE HALTED: ${reason} | remaining=${this.queue.length}`);

        // Save any remaining queued items locally
        const remaining = [...this.queue];
        this.queue = [];

        for (const item of remaining) {
            this.saveLocally(item).catch((err) =>
                console.warn(`${ts(TAG)} Failed to save remaining item locally:`, err)
            );
        }
    }

    private notifyProgress(): void {
        if (!this.sessionId) return;

        const consultation = useConsultationStore.getState().getConsultation(this.sessionId);
        if (!consultation) return;

        const progress = {
            totalChunks: consultation.chunks.length + this.queue.length,
            uploadedChunks: consultation.chunks.filter((c) => c.status === "uploaded").length,
            failedChunks: consultation.chunks.filter((c) => c.status === "failed").length,
            currentlyUploading: this.processing,
        };

        console.log(
            `${ts(TAG)} Progress: ${progress.uploadedChunks}/${progress.totalChunks} uploaded | ${progress.failedChunks} failed | uploading=${progress.currentlyUploading}`
        );

        this.progressListeners.forEach((listener) => listener(progress));
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

/** Singleton instance */
export const chunkUploadQueue = new ChunkUploadQueue();
