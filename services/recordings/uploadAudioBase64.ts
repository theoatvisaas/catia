import { supabase } from "@/lib/supabase/supabase";
import { guessContentTypeByExt, guessExtension } from "@/types/fileHelpers";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";

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
    console.log("🚀 [UPLOAD START]");
    console.log("fileUri:", fileUri);
    console.log("bucket:", bucket);
    console.log("storagePath:", storagePath);
    // 1) Ler arquivo local como base64
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
    });

    // 2) Converter base64 -> ArrayBuffer (não fica como string no upload)
    const arrayBuffer = decode(base64);

    // 3) Inferir content-type
    const ext = guessExtension(fileUri);
    const contentType = guessContentTypeByExt(ext);

    console.log("📄 contentType:", contentType);

    // 4) Upload no Supabase Storage
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, arrayBuffer, {
            contentType,
            upsert,
            cacheControl: "3600",
        });

    if (error) {
        console.log("UPLOAD ERROR:", JSON.stringify(error, null, 2));
        throw error;
    }

    return data;
}
