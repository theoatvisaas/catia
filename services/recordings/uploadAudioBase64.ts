import { getAuthenticatedSupabase } from "@/lib/supabase/supabase";
import { ts } from "@/lib/logger";
import { guessContentTypeByExt, guessExtension } from "@/types/fileHelpers";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";

const TAG = "[UploadAudio]";

type UploadAudioBase64Args = {
    fileUri: string;
    bucket: string;
    storagePath: string; // ex: `${userId}/recordings/${fileName}`
    upsert?: boolean;
};

export async function uploadAudioBase64({
    fileUri,
    bucket,
    storagePath,
    upsert = false,
}: UploadAudioBase64Args) {
    console.log(`${ts(TAG)} START | fileUri=${fileUri} | bucket=${bucket} | storagePath=${storagePath}`);

    // 1) Read local file as base64
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
    });
    console.log(`${ts(TAG)} Read file: ${base64.length} base64 chars`);

    // 2) Convert base64 -> ArrayBuffer
    const arrayBuffer = decode(base64);
    console.log(`${ts(TAG)} Decoded to ${arrayBuffer.byteLength} bytes`);

    // 3) Infer content-type
    const ext = guessExtension(fileUri);
    const contentType = guessContentTypeByExt(ext);
    console.log(`${ts(TAG)} contentType=${contentType} (ext=${ext})`);

    // 4) Get authenticated Supabase client
    const supabase = await getAuthenticatedSupabase();

    // 5) Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, arrayBuffer, {
            contentType,
            upsert,
            cacheControl: "3600",
        });

    if (error) {
        console.error(`${ts(TAG)} ❌ Upload error: ${error.message}`);
        throw error;
    }

    console.log(`${ts(TAG)} ✅ Uploaded: ${data.path}`);
    return data;
}
