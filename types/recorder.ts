export type UploadRecordInput = {
    uri: string;
    patientName: string;
    guardianName: string;
    sex: "male" | "female" | null;
    durationMs: number;
};

export type UploadRecordResponse = {
    ok?: boolean;
    recordId?: string;
};
