import { UploadRecordInput, UploadRecordResponse } from "@/types/recorder";
import { api } from "./api";
import { getValidAccessToken } from "./auth/token";

export const recordService = {
    uploadRecordedService: async (input: UploadRecordInput) => {
        const token = await getValidAccessToken();

        const form = new FormData();
        form.append("patientName", input.patientName);
        form.append("guardianName", input.guardianName);
        if (input.sex) form.append("sex", input.sex);

        form.append("durationMs", String(input.durationMs));

        form.append("file", {
            uri: input.uri,
            name: "recording.m4a",
            type: "audio/m4a",
        } as any);

        console.log("🎙️ uploadRecordedAudio payload:", {
            patientName: input.patientName,
            guardianName: input.guardianName,
            sex: input.sex,
            durationMs: input.durationMs,
            uri: input.uri,
        });

        return api<UploadRecordResponse>({
            path: "/records",
            method: "POST",
            body: form as any,
            token,
        });
    },
};
