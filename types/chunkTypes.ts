export type ChunkStatus = "pending" | "uploading" | "uploaded" | "failed";

export type ChunkMeta = {
    index: number;
    storagePath: string;
    status: ChunkStatus;
    sizeBytes: number;
    retryCount: number;
    /** Position in the recording stream (bytes) at the start of this chunk */
    streamPosition: number;
};

export type RecordingSessionState = {
    sessionId: string;
    userId: string;
    bucket: string;
    /** Base storage prefix: {userId}/recordings/{sessionId}/ */
    storagePrefix: string;
    chunks: ChunkMeta[];
    nextChunkIndex: number;
    startedAt: number;
    finalized: boolean;
    patientName: string;
    guardianName: string;
    sex: "male" | "female" | null;
};

export type ChunkUploadProgress = {
    totalChunks: number;
    uploadedChunks: number;
    failedChunks: number;
    currentlyUploading: boolean;
};
