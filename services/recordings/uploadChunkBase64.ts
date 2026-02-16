import { getAuthenticatedSupabase } from "@/lib/supabase/supabase";
import { ts } from "@/lib/logger";
import { decodeAndConcatenate, wrapPcmInWav } from "./pcmUtils";

const TAG = "[UploadChunk]";

type UploadChunkArgs = {
    /** Array of base64 strings — each one decoded individually then concatenated as bytes. */
    base64Chunks: string[];
    bucket: string;
    storagePath: string;
    contentType?: string;
    wrapAsWav?: boolean;
    sampleRate?: number;
    channels?: number;
    bitsPerSample?: number;
};

export async function uploadChunkBase64({
    base64Chunks,
    bucket,
    storagePath,
    contentType = "audio/wav",
    wrapAsWav = true,
    sampleRate = 16000,
    channels = 1,
    bitsPerSample = 16,
}: UploadChunkArgs) {
    console.log(`${ts(TAG)} START | chunks=${base64Chunks.length} | bucket=${bucket} | path=${storagePath}`);

    const decodeT0 = Date.now();
    const pcmBuffer = decodeAndConcatenate(base64Chunks);
    console.log(`${ts(TAG)} decode took ${Date.now() - decodeT0}ms | pcmSize=${pcmBuffer.byteLength}B`);

    const wrapT0 = Date.now();
    const uploadBuffer = wrapAsWav
        ? wrapPcmInWav(pcmBuffer, sampleRate, channels, bitsPerSample)
        : pcmBuffer;
    console.log(`${ts(TAG)} wavWrap took ${Date.now() - wrapT0}ms | uploadSize=${uploadBuffer.byteLength}B`);

    console.log(
        `${ts(TAG)} Uploading ${uploadBuffer.byteLength}B to ${bucket}/${storagePath} (wav=${wrapAsWav})`
    );

    const authT0 = Date.now();
    const supabase = await getAuthenticatedSupabase();
    console.log(`${ts(TAG)} getAuthenticatedSupabase took ${Date.now() - authT0}ms`);

    console.log(`${ts(TAG)} CALLING supabase.storage.upload()...`);
    const uploadT0 = Date.now();
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, uploadBuffer, {
            contentType: wrapAsWav ? "audio/wav" : contentType,
            upsert: false,
            cacheControl: "3600",
        });
    console.log(`${ts(TAG)} supabase.storage.upload() returned in ${Date.now() - uploadT0}ms | hasError=${!!error} | hasData=${!!data}`);

    if (error) {
        console.error(`${ts(TAG)} ❌ Upload error: ${error.message}`);
        throw error;
    }

    console.log(`${ts(TAG)} ✅ Uploaded: ${data.path}`);
    return data;
}
