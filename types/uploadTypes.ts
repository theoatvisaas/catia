export type SexKey = "male" | "female" | null;

export type UploadRecordingInput = {
    uri: string;
    userId: string;
    patientName: string;
    guardianName: string;
    sex: SexKey;
    durationMs: number;
};

export type UploadResult = {
    bucket: string;
    storagePath: string;
    publicUrl?: string;
};

export type CreateRecordingSessionInput = {
    session_id: string;
    user_id: string;
    storage_bucket: string;
    storage_prefix: string;
    patient_name: string;
    guardian_name: string;
    sex: SexKey;
    duration_ms: number;
    chunk_count: number;
    status: "complete" | "partial";
    full_file_path?: string | null;
};
