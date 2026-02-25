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

// ── Remote Consultation (fetched from Supabase) ─────────

/** Consultation fetched from Supabase — display-only fields, no chunk data */
export type RemoteConsultation = {
    sessionId: string;
    userId: string;
    patientName: string;
    guardianName: string;
    sex: SexKey;
    syncStatus: "synced";
    durationMs: number;
    chunkCount: number;
    /** Epoch ms — parsed from created_at ISO string (when recording started locally) */
    createdAt: number;
    /** Epoch ms — parsed from finalized_at ISO string (when synced to Supabase) */
    finalizedAt: number;
    storageBucket: string;
    storagePrefix: string;
};

// ── Example Consultation (for new users) ────────────────

/** Lightweight consultation for demo/example purposes — no chunks, no sync */
export type ExampleConsultation = {
    sessionId: string;
    patientName: string;
    guardianName: string;
    durationMs: number;
    createdAt: number;
    isExample: true;
};

// ── Display Consultation (union for History screen) ─────

/** Discriminated union for items in the History list */
export type DisplayConsultation =
    | (Consultation & { source: "local" })
    | (RemoteConsultation & { source: "remote" })
    | (ExampleConsultation & { source: "example" });

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
