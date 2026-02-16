/**
 * Builds a playable WAV file from the last ~20 seconds of a consultation's
 * recorded audio. Used when resuming an interrupted recording so the user
 * can hear where the recording stopped.
 *
 * 100% local — no network dependency. Relies on the N-1 retention policy
 * that keeps the last two chunks on disk at all times.
 */

import * as FileSystem from "expo-file-system";
import { encode } from "base64-arraybuffer";
import { useConsultationStore } from "@/stores/consultation/useConsultationStore";
import { readLocalChunk } from "./chunkStorage";
import { decodeAndConcatenate, wrapPcmInWav } from "./pcmUtils";
import { ts } from "@/lib/logger";

const TAG = "[AudioPreview]";
const PREVIEW_SECONDS = 20;

export type AudioPreviewResult = {
    uri: string;
    durationSeconds: number;
};

/**
 * Build a playable WAV preview from the last ~20 seconds of a consultation.
 *
 * Strategy:
 * 1. Read the last 2 chunks from local .b64 files (guaranteed by N-1 retention)
 * 2. Concatenate their base64 lines (penultimate + last)
 * 3. Take the last ~20 lines (~20 seconds)
 * 4. Decode PCM, wrap in WAV header, write to cache
 *
 * @returns Object with URI and duration, or null if no audio available
 */
export async function buildAudioPreview(sessionId: string): Promise<AudioPreviewResult | null> {
    console.log(`${ts(TAG)} buildAudioPreview(${sessionId}) | START`);

    const store = useConsultationStore.getState();
    const consultation = store.getConsultation(sessionId);

    if (!consultation || consultation.chunks.length === 0) {
        console.log(`${ts(TAG)} buildAudioPreview() | No chunks available`);
        return null;
    }

    // Sort chunks by order descending to get the last ones
    const sortedChunks = [...consultation.chunks].sort((a, b) => b.order - a.order);
    const lastChunk = sortedChunks[0];
    const penultimateChunk = sortedChunks.length > 1 ? sortedChunks[1] : null;

    console.log(
        `${ts(TAG)} buildAudioPreview() | lastChunk=#${lastChunk.index} (order=${lastChunk.order}) | ` +
        `penultimate=${penultimateChunk ? `#${penultimateChunk.index}` : "none"}`
    );

    // Collect base64 lines from the last 2 chunks
    const allLines: string[] = [];

    // Read penultimate chunk first (if exists and we need more than last chunk provides)
    if (penultimateChunk?.localFilePath) {
        try {
            const info = await FileSystem.getInfoAsync(penultimateChunk.localFilePath);
            if (info.exists) {
                const lines = await readLocalChunk(penultimateChunk.localFilePath);
                allLines.push(...lines);
                console.log(`${ts(TAG)} buildAudioPreview() | Penultimate chunk #${penultimateChunk.index}: ${lines.length} lines`);
            } else {
                console.warn(`${ts(TAG)} buildAudioPreview() | Penultimate chunk file not found: ${penultimateChunk.localFilePath}`);
            }
        } catch (err) {
            console.warn(`${ts(TAG)} buildAudioPreview() | Failed to read penultimate chunk:`, err);
        }
    }

    // Read last chunk
    if (lastChunk.localFilePath) {
        try {
            const info = await FileSystem.getInfoAsync(lastChunk.localFilePath);
            if (info.exists) {
                const lines = await readLocalChunk(lastChunk.localFilePath);
                allLines.push(...lines);
                console.log(`${ts(TAG)} buildAudioPreview() | Last chunk #${lastChunk.index}: ${lines.length} lines`);
            } else {
                console.warn(`${ts(TAG)} buildAudioPreview() | Last chunk file not found: ${lastChunk.localFilePath}`);
            }
        } catch (err) {
            console.warn(`${ts(TAG)} buildAudioPreview() | Failed to read last chunk:`, err);
        }
    }

    if (allLines.length === 0) {
        console.warn(`${ts(TAG)} buildAudioPreview() | No audio lines found in local files`);
        return null;
    }

    // Take the last ~20 lines (~20 seconds of audio)
    const previewLines = allLines.slice(-PREVIEW_SECONDS);
    console.log(`${ts(TAG)} buildAudioPreview() | Using ${previewLines.length} lines (~${previewLines.length}s) from ${allLines.length} total`);

    // Decode base64 → PCM → WAV
    const pcmBuffer = decodeAndConcatenate(previewLines);
    const wavBuffer = wrapPcmInWav(pcmBuffer);

    // Write to cache directory
    const tempPath = `${FileSystem.cacheDirectory}preview_${sessionId}.wav`;
    const wavBase64 = encode(wavBuffer);
    await FileSystem.writeAsStringAsync(tempPath, wavBase64, {
        encoding: FileSystem.EncodingType.Base64,
    });

    const durationSeconds = previewLines.length;

    console.log(
        `${ts(TAG)} buildAudioPreview() | ✅ WAV written: ${tempPath} | ` +
        `pcm=${pcmBuffer.byteLength}B | wav=${wavBuffer.byteLength}B | duration=~${durationSeconds}s`
    );

    return { uri: tempPath, durationSeconds };
}
