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
