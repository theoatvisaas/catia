import type { SexKey } from "./uploadTypes";

// ── Sync States ──────────────────────────────────────────

/** Overall sync status of a consultation */
export type ConsultationSyncStatus = "local" | "partial" | "synced" | "discarded";

/** Sync status of an individual chunk */
export type ChunkSyncStatus = "pending_local" | "uploading" | "uploaded" | "failed";

// ── Chunk ────────────────────────────────────────────────

export type ChunkRecord = {
    /** Index used for naming (chunk_0000.wav, chunk_0001.wav...) */
    index: number;
    /** Sequential order in the recording — sent to backend for reassembly */
    order: number;
    /** Supabase Storage path: {userId}/recordings/{sessionId}/chunk_XXXX.wav */
    storagePath: string;
    status: ChunkSyncStatus;
    sizeBytes: number;
    retryCount: number;
    /** Position in the audio stream (bytes) at the start of this chunk */
    streamPosition: number;
    /** Local file path if chunk data is saved to device (for local/failed chunks) */
    localFilePath?: string;
    lastError?: string;
};

// ── Consultation ─────────────────────────────────────────

export type Consultation = {
    /** Unique identifier: timestamp_random */
    sessionId: string;
    userId: string;

    // Patient metadata
    patientName: string;
    guardianName: string;
    sex: SexKey;

    // Sync state
    syncStatus: ConsultationSyncStatus;

    // Chunks
    chunks: ChunkRecord[];
    /** Index for the next chunk to be created */
    nextChunkIndex: number;

    // Storage
    bucket: string;
    /** Base storage prefix: {userId}/recordings/{sessionId} */
    storagePrefix: string;

    // Timing
    createdAt: number;
    lastSyncedAt?: number;
    finishedAt?: number;

    // Duration
    durationMs: number;

    // Error tracking
    lastError?: string;
    globalRetryCount: number;

    // Recovery
    hasTempBuffer: boolean;

    /** true = user pressed "Stop" (recording finished normally) */
    userFinalized: boolean;
};

// ── Sync Progress ────────────────────────────────────────

export type SyncProgress = {
    sessionId: string;
    totalChunks: number;
    uploadedChunks: number;
    failedChunks: number;
    pendingLocalChunks: number;
    currentlyUploading: boolean;
    /** Overall percentage 0-100 */
    percent: number;
};

// ── Network ──────────────────────────────────────────────

export type NetworkStatus = {
    isConnected: boolean;
    type: "wifi" | "cellular" | "none" | "unknown";
};
