import { supabase } from "@/lib/supabase/supabase";
import { createRecording } from "@/services/recordings/recordingsRepo";
import { uploadAudioBase64 } from "@/services/recordings/uploadAudioBase64";
import { guessExtension } from "@/types/fileHelpers";
import { UploadRecordingInput, UploadResult } from "@/types/uploadTypes";
import { create } from "zustand";

type UploadState = {
    uploading: boolean;
    error: string | null;

    lastResult: UploadResult | null;

    uploadRecording: (input: UploadRecordingInput) => Promise<UploadResult>;
};

export const useUploadStore = create<UploadState>((set, get) => ({
    uploading: false,
    error: null,
    lastResult: null,

    uploadRecording: async (input) => {
        if (get().uploading) throw new Error("Upload already in progress.");

        set({ uploading: true, error: null, lastResult: null });

        try {
            const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
            if (sessionErr) throw sessionErr;

            const session = sessionData.session;
            if (!session?.user?.id) throw new Error("Not authenticated.");

            const userId = session.user.id;

            const bucket = process.env.EXPO_PUBLIC_SUPABASE_BUCKET || "recordings";

            const ext = guessExtension(input.uri);
            const fileName = `${Date.now()}.${ext}`;
            const storagePath = `${userId}/recordings/${fileName}`;

            await uploadAudioBase64({
                fileUri: input.uri,
                bucket,
                storagePath,
                upsert: false,
            });

            const row = await createRecording({
                user_id: userId,
                storage_bucket: bucket,
                storage_path: storagePath,
                patient_name: input.patientName,
                guardian_name: input.guardianName,
                sex: input.sex,
                duration_ms: input.durationMs,
            });



            const result: UploadResult = {
                bucket,
                storagePath,
            };

            set({ uploading: false, lastResult: result });
            return result;
        } catch (e: any) {
            set({ uploading: false, error: e?.message ?? "Upload failed" });
            throw e;
        }
    },
}));
