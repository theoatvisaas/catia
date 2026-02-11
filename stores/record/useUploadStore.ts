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
        console.log("🟣 [uploadRecording] input:", input);
        //const { data } = await supabase.auth.getSession();
        //console.log("session user:", data.session?.user?.id);

        if (get().uploading) throw new Error("Upload already in progress.");
        set({ uploading: true, error: null, lastResult: null });

        try {
            /* console.log("🟣 step 1: getSession");
            const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
            console.log("🟣 step 1 done:", { hasSession: !!sessionData?.session, sessionErr }); */

            /*   if (sessionErr) throw sessionErr;
  
              const session = sessionData.session;
              if (!session?.user?.id) throw new Error("Not authenticated.");
  
              const userId = session.user.id;
   */
            const userId = input.userId;

            const bucket = process.env.EXPO_PUBLIC_SUPABASE_BUCKET || "recordings";
            const ext = guessExtension(input.uri);
            const fileName = `${Date.now()}.${ext}`;
            const storagePath = `${userId}/recordings/${fileName}`;

            console.log("🟣 step 2: uploadAudioBase64", { bucket, storagePath, ext });

            const uploadRes = await uploadAudioBase64({
                fileUri: input.uri,
                bucket,
                storagePath,
                upsert: false,
            });

            console.log("🟣 step 2 done: uploadRes", uploadRes);

            console.log("🟣 step 3: createRecording");
            /* const row = await createRecording({
                user_id: userId,
                storage_bucket: bucket,
                storage_path: storagePath,
                patient_name: input.patientName,
                guardian_name: input.guardianName,
                sex: input.sex,
                duration_ms: input.durationMs,
            }); */

            //console.log("🟣 step 3 done: row", row);

            const result: UploadResult = { bucket, storagePath };
            set({ uploading: false, lastResult: result });

            console.log("🟣 DONE", result);
            return result;
        } catch (e: any) {
            console.log("🔴 uploadRecording ERROR", e);
            set({ uploading: false, error: e?.message ?? "Upload failed" });
            throw e;
        }
    }

}));
