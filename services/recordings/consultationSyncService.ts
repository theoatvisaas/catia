import { ts } from "@/lib/logger";
import { getAuthenticatedSupabase } from "@/lib/supabase/supabase";
import { useConsultationStore } from "@/stores/consultation/useConsultationStore";
import { getNetworkStatus } from "../network/networkMonitor";
import { ensureValidSession } from "./tokenGuard";
import { readLocalChunk, deleteSessionChunks, getTempBufferPath } from "./chunkStorage";
import { uploadChunkBase64 } from "./uploadChunkBase64";
import { chunkUploadQueue } from "./chunkUploadQueue";
import * as FileSystem from "expo-file-system";
import type { ChunkRecord, Consultation } from "@/types/consultationTypes";

const TAG = "[SyncService]";

// ── Parallel upload config ──────────────────────────────

/** Max concurrent chunk uploads. 3 balances bandwidth saturation vs. memory (~7.5MB peak). */
const MAX_PARALLEL_UPLOADS = 3;

type ChunkUploadResult = {
    chunkIndex: number;
    order: number;
    success: boolean;
    error?: string;
    elapsed?: number;
    sizeBytes?: number;
};

// ── Single-chunk upload helper ──────────────────────────

/**
 * Upload a single chunk: read local file → decode → upload → update store.
 * Returns a result object (never throws).
 */
async function uploadSingleChunk(
    sessionId: string,
    chunk: ChunkRecord,
    consultation: Consultation,
): Promise<ChunkUploadResult> {
    const store = useConsultationStore.getState();

    // Check network before this chunk
    const netCheck = getNetworkStatus();
    if (!netCheck.isConnected) {
        console.warn(`${ts(TAG)} uploadSingleChunk() | Lost network before chunk #${chunk.index}`);
        store.updateChunkStatus(sessionId, chunk.index, "failed", {
            lastError: "Network lost during upload batch",
            retryCount: chunk.retryCount + 1,
        });
        return { chunkIndex: chunk.index, order: chunk.order, success: false, error: "No network" };
    }

    // Read local data
    if (!chunk.localFilePath) {
        console.warn(`${ts(TAG)} uploadSingleChunk() | Chunk #${chunk.index} has NO local file`);
        store.updateChunkStatus(sessionId, chunk.index, "failed", {
            lastError: "No local file path",
        });
        return { chunkIndex: chunk.index, order: chunk.order, success: false, error: "No local file" };
    }

    let base64Chunks: string[];
    try {
        base64Chunks = await readLocalChunk(chunk.localFilePath);
        console.log(
            `${ts(TAG)} uploadSingleChunk() | Read ${base64Chunks.length} base64 lines from chunk #${chunk.index}`
        );
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`${ts(TAG)} uploadSingleChunk() | ❌ Failed to read chunk #${chunk.index}: ${msg}`);
        store.updateChunkStatus(sessionId, chunk.index, "failed", {
            lastError: `Local file unreadable: ${msg}`,
            retryCount: chunk.retryCount + 1,
        });
        return { chunkIndex: chunk.index, order: chunk.order, success: false, error: msg };
    }

    if (base64Chunks.length === 0) {
        console.warn(`${ts(TAG)} uploadSingleChunk() | Chunk #${chunk.index} local file is EMPTY`);
        store.updateChunkStatus(sessionId, chunk.index, "failed", {
            lastError: "Local file empty",
        });
        return { chunkIndex: chunk.index, order: chunk.order, success: false, error: "Empty file" };
    }

    // Upload
    const totalB64Len = base64Chunks.reduce((sum, s) => sum + s.length, 0);
    const estimatedSize = Math.ceil((totalB64Len * 3) / 4);

    console.log(
        `${ts(TAG)} uploadSingleChunk() | UPLOADING chunk #${chunk.index} (order=${chunk.order}) | ${base64Chunks.length} items | ~${estimatedSize}B | path=${chunk.storagePath}`
    );

    try {
        const t0 = Date.now();
        const result = await uploadChunkBase64({
            base64Chunks,
            bucket: consultation.bucket,
            storagePath: chunk.storagePath,
        });
        const elapsed = Date.now() - t0;

        if (!result?.path) {
            throw new Error("Upload returned no path");
        }

        store.updateChunkStatus(sessionId, chunk.index, "uploaded");

        console.log(
            `${ts(TAG)} uploadSingleChunk() | ✅ Chunk #${chunk.index} (order=${chunk.order}) SYNCED | ~${estimatedSize}B | ${elapsed}ms`
        );

        return { chunkIndex: chunk.index, order: chunk.order, success: true, elapsed, sizeBytes: estimatedSize };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`${ts(TAG)} uploadSingleChunk() | ❌ Chunk #${chunk.index} FAILED: ${msg}`);
        store.updateChunkStatus(sessionId, chunk.index, "failed", {
            lastError: msg,
            retryCount: chunk.retryCount + 1,
        });
        return { chunkIndex: chunk.index, order: chunk.order, success: false, error: msg };
    }
}

// ── Parallel upload pool ────────────────────────────────

/**
 * Upload multiple chunks in parallel with a concurrency limit.
 *
 * Uses a worker-pool pattern: N workers pull from a shared queue.
 * All chunks are marked "uploading" upfront for UI feedback.
 * Each chunk's result is independent — no halt-on-failure.
 */
async function parallelUploadChunks(
    sessionId: string,
    chunks: ChunkRecord[],
    consultation: Consultation,
    concurrency: number = MAX_PARALLEL_UPLOADS,
): Promise<ChunkUploadResult[]> {
    const store = useConsultationStore.getState();
    const results: ChunkUploadResult[] = [];

    // Mark all chunks as "uploading" upfront for immediate UI feedback
    for (const chunk of chunks) {
        store.updateChunkStatus(sessionId, chunk.index, "uploading");
    }

    console.log(
        `${ts(TAG)} parallelUploadChunks() | ${chunks.length} chunks | concurrency=${Math.min(concurrency, chunks.length)}`
    );

    // Shared index counter — each worker increments atomically (JS is single-threaded)
    let nextIdx = 0;

    async function worker(): Promise<void> {
        while (nextIdx < chunks.length) {
            const idx = nextIdx++;
            if (idx >= chunks.length) break;

            const result = await uploadSingleChunk(sessionId, chunks[idx], consultation);
            results.push(result);
        }
    }

    // Launch workers (capped at chunk count)
    const workerCount = Math.min(concurrency, chunks.length);
    const workers = Array.from({ length: workerCount }, () => worker());
    await Promise.all(workers);

    return results;
}

// ── Retry a single consultation ──────────────────────────

/**
 * Attempt to upload all non-uploaded chunks for a consultation in parallel.
 * Reads chunk data from local files and uploads up to MAX_PARALLEL_UPLOADS
 * concurrently.
 *
 * Returns `true` if all chunks are now uploaded, `false` otherwise.
 * On partial failure, successful chunks stay "uploaded" — only failed ones
 * are retried on the next call.
 */
export async function retrySyncConsultation(sessionId: string): Promise<boolean> {
    console.log(`${ts(TAG)} retrySyncConsultation(${sessionId}) | START`);

    const store = useConsultationStore.getState();
    const consultation = store.getConsultation(sessionId);
    if (!consultation) {
        console.warn(`${ts(TAG)} retrySyncConsultation() | No consultation found for ${sessionId}`);
        return false;
    }

    console.log(
        `${ts(TAG)} retrySyncConsultation() | session=${sessionId} | syncStatus=${consultation.syncStatus} | chunks=${consultation.chunks.length} | userFinalized=${consultation.userFinalized}`
    );

    const network = getNetworkStatus();
    console.log(`${ts(TAG)} retrySyncConsultation() | network=${network.isConnected ? network.type : "OFFLINE"}`);
    if (!network.isConnected) {
        console.log(`${ts(TAG)} retrySyncConsultation() | ABORTED — no network`);
        return false;
    }

    console.log(`${ts(TAG)} retrySyncConsultation() | Checking auth session...`);
    const valid = await ensureValidSession();
    if (!valid) {
        console.warn(`${ts(TAG)} retrySyncConsultation() | ABORTED — auth invalid`);
        return false;
    }
    console.log(`${ts(TAG)} retrySyncConsultation() | Auth OK`);

    // Find chunks that need uploading, sorted by order
    const pending = consultation.chunks
        .filter((c) => c.status !== "uploaded")
        .sort((a, b) => a.order - b.order);

    const uploaded = consultation.chunks.filter((c) => c.status === "uploaded").length;
    console.log(
        `${ts(TAG)} retrySyncConsultation() | ${pending.length} pending chunks | ${uploaded} already uploaded | total=${consultation.chunks.length}`
    );

    if (pending.length === 0) {
        console.log(`${ts(TAG)} retrySyncConsultation() | All chunks already uploaded!`);
        return true;
    }

    // ── Parallel upload ──
    const t0 = Date.now();
    const results = await parallelUploadChunks(sessionId, pending, consultation);
    const elapsed = Date.now() - t0;

    const succeeded = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    // Log detailed results per chunk
    for (const r of results) {
        if (r.success) {
            console.log(
                `${ts(TAG)} retrySyncConsultation() | ✅ Chunk #${r.chunkIndex} (order=${r.order}) | ${r.elapsed}ms | ~${r.sizeBytes}B`
            );
        } else {
            console.log(
                `${ts(TAG)} retrySyncConsultation() | ❌ Chunk #${r.chunkIndex} (order=${r.order}) | error: ${r.error}`
            );
        }
    }

    console.log(
        `${ts(TAG)} retrySyncConsultation() | Parallel upload done | ${succeeded.length} succeeded, ${failed.length} failed | ${elapsed}ms total`
    );

    // Local chunk files are NOT deleted here — cleanup happens exclusively
    // in finalizeConsultation() after ALL chunks are uploaded and the
    // recording_session is created in Supabase.

    store.recomputeSyncStatus(sessionId);
    const finalStatus = store.getConsultation(sessionId)?.syncStatus;
    console.log(`${ts(TAG)} retrySyncConsultation(${sessionId}) | DONE — syncStatus=${finalStatus}`);
    return failed.length === 0;
}

// ── Resume partial session via upload queue ──────────────

/**
 * Re-enqueue pending chunks into the upload queue for a session.
 * Used when we want the queue's retry logic to handle uploads.
 */
export async function resumePartialSession(sessionId: string): Promise<void> {
    console.log(`${ts(TAG)} resumePartialSession(${sessionId}) | START`);

    const store = useConsultationStore.getState();
    const consultation = store.getConsultation(sessionId);
    if (!consultation) {
        console.warn(`${ts(TAG)} resumePartialSession() | No consultation found for ${sessionId}`);
        return;
    }

    // Set the queue to this session
    chunkUploadQueue.setSession(sessionId);

    // Find first non-uploaded chunk and enqueue from there
    const pending = consultation.chunks
        .filter((c) => c.status !== "uploaded")
        .sort((a, b) => a.order - b.order);

    console.log(
        `${ts(TAG)} resumePartialSession() | ${pending.length} pending chunks to re-enqueue (total=${consultation.chunks.length})`
    );

    let enqueued = 0;
    for (const chunk of pending) {
        if (!chunk.localFilePath) {
            console.warn(
                `${ts(TAG)} resumePartialSession() | Chunk #${chunk.index} (order=${chunk.order}) has no local file — skipping`
            );
            continue;
        }

        let base64Chunks: string[];
        try {
            base64Chunks = await readLocalChunk(chunk.localFilePath);
            console.log(
                `${ts(TAG)} resumePartialSession() | Read chunk #${chunk.index} — ${base64Chunks.length} base64 lines`
            );
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.warn(`${ts(TAG)} resumePartialSession() | Failed to read chunk #${chunk.index}: ${msg}`);
            continue;
        }

        if (base64Chunks.length === 0) {
            console.warn(`${ts(TAG)} resumePartialSession() | Chunk #${chunk.index} local file is empty — skipping`);
            continue;
        }

        chunkUploadQueue.enqueue({
            base64Chunks,
            chunkIndex: chunk.index,
            order: chunk.order,
            streamPositionStart: chunk.streamPosition,
        });
        enqueued++;
    }

    console.log(`${ts(TAG)} resumePartialSession(${sessionId}) | DONE — enqueued ${enqueued}/${pending.length} chunks`);
}

// ── Finalize consultation ────────────────────────────────

/**
 * After all chunks are uploaded, save metadata to `recording_sessions`
 * table and clean up local files. Marks consultation as `synced`.
 */
export async function finalizeConsultation(sessionId: string): Promise<boolean> {
    console.log(`${ts(TAG)} finalizeConsultation(${sessionId}) | START`);

    const store = useConsultationStore.getState();
    const consultation = store.getConsultation(sessionId);
    if (!consultation) {
        console.warn(`${ts(TAG)} finalizeConsultation() | No consultation found for ${sessionId}`);
        return false;
    }

    // Guard: skip empty sessions (0 chunks = no audio recorded)
    if (consultation.chunks.length === 0) {
        console.warn(`${ts(TAG)} finalizeConsultation() | ABORTED — 0 chunks (no audio was recorded)`);
        store.updateConsultation(sessionId, {
            syncStatus: "discarded",
            lastError: "Sessão vazia — nenhum áudio gravado",
        });
        return false;
    }

    // Verify all chunks are uploaded
    const allUploaded = consultation.chunks.every((c) => c.status === "uploaded");
    const uploadedCount = consultation.chunks.filter((c) => c.status === "uploaded").length;

    console.log(
        `${ts(TAG)} finalizeConsultation() | chunks: ${uploadedCount}/${consultation.chunks.length} uploaded | allUploaded=${allUploaded}`
    );

    if (!allUploaded) {
        console.warn(`${ts(TAG)} finalizeConsultation() | ABORTED — not all chunks uploaded`);
        return false;
    }

    // ── Upsert metadata to recording_sessions table ──
    console.log(`${ts(TAG)} finalizeConsultation() | Upserting metadata to recording_sessions table...`);

    const upsertData = {
        session_id: consultation.sessionId,
        user_id: consultation.userId,
        storage_bucket: consultation.bucket,
        storage_prefix: consultation.storagePrefix,
        patient_name: consultation.patientName || null,
        guardian_name: consultation.guardianName || null,
        sex: consultation.sex,
        duration_ms: consultation.durationMs,
        chunk_count: consultation.chunks.length,
        status: "synced",
        finalized_at: new Date().toISOString(),
    };

    console.log(`${ts(TAG)} finalizeConsultation() | Upsert data:`, JSON.stringify(upsertData, null, 2));

    const supabase = await getAuthenticatedSupabase();
    const { error } = await supabase.from("recording_sessions").upsert(
        upsertData,
        { onConflict: "session_id" }
    );

    if (error) {
        console.error(
            `${ts(TAG)} finalizeConsultation() | ❌ DB upsert FAILED: ${error.message} (code=${error.code})`
        );
        store.updateConsultation(sessionId, {
            lastError: `Finalize DB error: ${error.message}`,
        });
        // Keep status as partial — chunks are uploaded but DB record is missing.
        // autoSyncAll / retrySyncConsultation will retry later.
        throw new Error(`Finalize DB error: ${error.message} (code=${error.code})`);
    }

    console.log(`${ts(TAG)} finalizeConsultation() | ✅ DB upsert OK`);

    // Clean up local chunk files
    console.log(`${ts(TAG)} finalizeConsultation() | Deleting local chunk files for session ${sessionId}...`);
    await deleteSessionChunks(sessionId);
    console.log(`${ts(TAG)} finalizeConsultation() | Local files deleted`);

    // Mark as fully synced
    store.updateConsultation(sessionId, {
        syncStatus: "synced",
        lastSyncedAt: Date.now(),
        hasTempBuffer: false,
    });

    console.log(`${ts(TAG)} finalizeConsultation(${sessionId}) | ✅ DONE — consultation synced`);
    return true;
}

// ── Discard consultation ─────────────────────────────────

/**
 * Delete chunks from Supabase Storage + local files, mark as `discarded`.
 * This is an intentional user action — the data is gone.
 */
export async function discardConsultation(sessionId: string): Promise<void> {
    console.log(`${ts(TAG)} discardConsultation(${sessionId}) | START`);

    const store = useConsultationStore.getState();
    const consultation = store.getConsultation(sessionId);
    if (!consultation) {
        console.warn(`${ts(TAG)} discardConsultation() | No consultation found for ${sessionId}`);
        return;
    }

    console.log(
        `${ts(TAG)} discardConsultation() | syncStatus=${consultation.syncStatus} | chunks=${consultation.chunks.length}`
    );

    // Delete uploaded chunks from Supabase Storage
    const uploadedPaths = consultation.chunks
        .filter((c) => c.status === "uploaded")
        .map((c) => c.storagePath);

    // Get authenticated client for Storage operations
    let supabase;
    try {
        supabase = await getAuthenticatedSupabase();
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`${ts(TAG)} discardConsultation() | ⚠️ No auth token — skipping remote delete: ${msg}`);
        supabase = null;
    }

    if (supabase && uploadedPaths.length > 0) {
        console.log(
            `${ts(TAG)} discardConsultation() | Deleting ${uploadedPaths.length} uploaded chunks from Supabase Storage...`
        );
        const { error } = await supabase.storage
            .from(consultation.bucket)
            .remove(uploadedPaths);

        if (error) {
            console.warn(`${ts(TAG)} discardConsultation() | ⚠️ Failed to delete some chunks from Storage: ${error.message}`);
        } else {
            console.log(`${ts(TAG)} discardConsultation() | Supabase chunks deleted OK`);
        }
    } else if (uploadedPaths.length === 0) {
        console.log(`${ts(TAG)} discardConsultation() | No uploaded chunks to delete from Supabase`);
    }

    // Delete local chunk files
    console.log(`${ts(TAG)} discardConsultation() | Deleting local chunk files...`);
    await deleteSessionChunks(sessionId);
    console.log(`${ts(TAG)} discardConsultation() | Local files deleted`);

    // Mark as discarded in store
    store.updateConsultation(sessionId, {
        syncStatus: "discarded",
    });

    console.log(`${ts(TAG)} discardConsultation(${sessionId}) | ✅ DONE — consultation discarded`);
}

// ── Crash recovery ───────────────────────────────────────

/**
 * Recover a temp buffer file from a crashed session.
 * Reads the buffer, creates a local chunk from it.
 */
export async function recoverCrashedSession(sessionId: string): Promise<boolean> {
    console.log(`${ts(TAG)} recoverCrashedSession(${sessionId}) | START`);

    const store = useConsultationStore.getState();
    const consultation = store.getConsultation(sessionId);
    if (!consultation || !consultation.hasTempBuffer) {
        console.log(
            `${ts(TAG)} recoverCrashedSession() | SKIP — consultation=${!!consultation} hasTempBuffer=${consultation?.hasTempBuffer}`
        );
        return false;
    }

    const tempPath = getTempBufferPath(sessionId);
    console.log(`${ts(TAG)} recoverCrashedSession() | tempPath=${tempPath}`);

    try {
        const info = await FileSystem.getInfoAsync(tempPath);
        console.log(
            `${ts(TAG)} recoverCrashedSession() | tempFile exists=${info.exists} size=${info.exists ? (info as any).size ?? "?" : "N/A"}`
        );

        if (!info.exists || info.size === 0) {
            console.log(`${ts(TAG)} recoverCrashedSession() | No temp file or empty — clearing flag`);
            store.updateConsultation(sessionId, { hasTempBuffer: false });
            return false;
        }

        const raw = await FileSystem.readAsStringAsync(tempPath, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        const base64Lines = raw.split("\n").filter((line) => line.length > 0);
        console.log(
            `${ts(TAG)} recoverCrashedSession() | Read temp buffer: ${base64Lines.length} audio segments | rawLen=${raw.length} chars`
        );

        if (base64Lines.length === 0) {
            console.log(`${ts(TAG)} recoverCrashedSession() | Temp buffer has no valid lines — clearing flag`);
            store.updateConsultation(sessionId, { hasTempBuffer: false });
            return false;
        }

        // Determine chunk index and order
        const nextIndex = consultation.nextChunkIndex;
        const nextOrder = consultation.chunks.length;
        const storagePath = `${consultation.storagePrefix}/chunk_${String(nextIndex).padStart(4, "0")}.wav`;

        // Estimate size
        const totalBase64Len = base64Lines.reduce((sum, s) => sum + s.length, 0);
        const estimatedSize = Math.ceil((totalBase64Len * 3) / 4);

        console.log(
            `${ts(TAG)} recoverCrashedSession() | Creating chunk: index=${nextIndex} order=${nextOrder} | ~${estimatedSize}B | storagePath=${storagePath}`
        );

        // Save as a local chunk file
        const { saveChunkLocally } = await import("./chunkStorage");
        const localPath = await saveChunkLocally(sessionId, nextIndex, base64Lines);
        console.log(`${ts(TAG)} recoverCrashedSession() | Saved as local chunk: ${localPath}`);

        // Add to store
        store.addChunk(sessionId, {
            index: nextIndex,
            order: nextOrder,
            storagePath,
            status: "pending_local",
            sizeBytes: estimatedSize,
            retryCount: 0,
            streamPosition: 0,
            localFilePath: localPath,
        });

        // Delete temp buffer
        await FileSystem.deleteAsync(tempPath, { idempotent: true });
        store.updateConsultation(sessionId, { hasTempBuffer: false });

        console.log(
            `${ts(TAG)} recoverCrashedSession(${sessionId}) | ✅ RECOVERED ${base64Lines.length} audio segments (~${estimatedSize}B) as chunk #${nextIndex}`
        );
        return true;
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`${ts(TAG)} recoverCrashedSession() | ❌ FAILED: ${msg}`);
        return false;
    }
}

// ── Auto-sync all ────────────────────────────────────────

/**
 * Iterate all incomplete consultations and attempt to sync them.
 * Called on startup and when network is restored.
 */
export async function autoSyncAll(): Promise<void> {
    console.log(`${ts(TAG)} autoSyncAll() | START`);

    const network = getNetworkStatus();
    console.log(`${ts(TAG)} autoSyncAll() | network=${network.isConnected ? network.type : "OFFLINE"}`);

    if (!network.isConnected) {
        console.log(`${ts(TAG)} autoSyncAll() | ABORTED — no network`);
        return;
    }

    console.log(`${ts(TAG)} autoSyncAll() | Checking auth session...`);
    const valid = await ensureValidSession();
    if (!valid) {
        console.warn(`${ts(TAG)} autoSyncAll() | ABORTED — auth invalid`);
        return;
    }
    console.log(`${ts(TAG)} autoSyncAll() | Auth OK`);

    const store = useConsultationStore.getState();
    const incomplete = store.getIncompleteConsultations();

    console.log(
        `${ts(TAG)} autoSyncAll() | Found ${incomplete.length} incomplete consultation(s):`
    );
    for (const c of incomplete) {
        const uploaded = c.chunks.filter((ch) => ch.status === "uploaded").length;
        const pending = c.chunks.filter((ch) => ch.status !== "uploaded").length;
        console.log(
            `${ts(TAG)}   → ${c.sessionId} | status=${c.syncStatus} | finalized=${c.userFinalized} | chunks: ${uploaded}✅ ${pending}⏳ / ${c.chunks.length} total`
        );
    }

    let syncedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const consultation of incomplete) {
        // Skip if user hasn't finalized (still recording)
        if (!consultation.userFinalized) {
            console.log(
                `${ts(TAG)} autoSyncAll() | SKIP ${consultation.sessionId} — not finalized by user (still recording?)`
            );
            skippedCount++;
            continue;
        }

        console.log(`${ts(TAG)} autoSyncAll() | Syncing ${consultation.sessionId}...`);

        try {
            const allSynced = await retrySyncConsultation(consultation.sessionId);

            if (allSynced) {
                // All chunks uploaded — finalize
                console.log(`${ts(TAG)} autoSyncAll() | All chunks uploaded for ${consultation.sessionId} — finalizing...`);
                await finalizeConsultation(consultation.sessionId);
                syncedCount++;
            } else {
                console.log(`${ts(TAG)} autoSyncAll() | Sync incomplete for ${consultation.sessionId}`);
                failedCount++;
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.warn(
                `${ts(TAG)} autoSyncAll() | ❌ Auto-sync FAILED for ${consultation.sessionId}: ${msg}`
            );
            store.updateConsultation(consultation.sessionId, {
                globalRetryCount: consultation.globalRetryCount + 1,
                lastError: msg,
            });
            failedCount++;
        }
    }

    console.log(
        `${ts(TAG)} autoSyncAll() | DONE — synced=${syncedCount} | skipped=${skippedCount} | failed=${failedCount} | total=${incomplete.length}`
    );
}

// ── Sync progress ────────────────────────────────────────

/**
 * Compute sync progress for a consultation.
 */
export function getSyncProgress(sessionId: string) {
    const store = useConsultationStore.getState();
    const consultation = store.getConsultation(sessionId);
    if (!consultation) return null;

    const total = consultation.chunks.length;
    const uploaded = consultation.chunks.filter((c) => c.status === "uploaded").length;
    const failed = consultation.chunks.filter((c) => c.status === "failed").length;
    const pendingLocal = consultation.chunks.filter((c) => c.status === "pending_local").length;
    const uploading = consultation.chunks.filter((c) => c.status === "uploading").length;
    const percent = total > 0 ? Math.round((uploaded / total) * 100) : 0;

    console.log(
        `${ts(TAG)} getSyncProgress(${sessionId}) | ${uploaded}✅ ${uploading}⬆️ ${pendingLocal}📁 ${failed}❌ / ${total} total | ${percent}%`
    );

    return {
        sessionId,
        totalChunks: total,
        uploadedChunks: uploaded,
        failedChunks: failed,
        pendingLocalChunks: pendingLocal,
        currentlyUploading: uploading > 0,
        percent,
    };
}
