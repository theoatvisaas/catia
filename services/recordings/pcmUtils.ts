/**
 * Shared PCM audio utilities.
 *
 * Used by:
 * - uploadChunkBase64.ts (encoding chunks for Supabase upload)
 * - audioPreviewBuilder.ts (building playable WAV previews)
 */

import { decode } from "base64-arraybuffer";

/**
 * Decode each base64 string individually and concatenate the resulting bytes.
 *
 * IMPORTANT: We cannot just do `chunks.join("")` on the base64 strings because
 * each string may have padding (`=`/`==`) at the end. Joining padded base64
 * produces an invalid string that corrupts the decoded output, causing periodic
 * noise/glitches in the audio.
 */
export function decodeAndConcatenate(base64Chunks: string[]): ArrayBuffer {
    // Decode each chunk individually
    const buffers = base64Chunks.map((b64) => decode(b64));

    // Calculate total size
    const totalSize = buffers.reduce((sum, buf) => sum + buf.byteLength, 0);

    // Concatenate into a single ArrayBuffer
    const result = new ArrayBuffer(totalSize);
    const resultView = new Uint8Array(result);
    let offset = 0;

    for (const buf of buffers) {
        resultView.set(new Uint8Array(buf), offset);
        offset += buf.byteLength;
    }

    return result;
}

/**
 * Prepend a 44-byte WAV header to raw PCM data so the resulting
 * file is a valid WAV that any player can open.
 */
export function wrapPcmInWav(
    pcmBuffer: ArrayBuffer,
    sampleRate = 16000,
    channels = 1,
    bitsPerSample = 16,
): ArrayBuffer {
    const pcmBytes = pcmBuffer.byteLength;
    const wavBuffer = new ArrayBuffer(44 + pcmBytes);
    const view = new DataView(wavBuffer);

    const byteRate = sampleRate * channels * (bitsPerSample / 8);
    const blockAlign = channels * (bitsPerSample / 8);

    // RIFF header
    view.setUint32(0, 0x52494646, false);  // "RIFF"
    view.setUint32(4, 36 + pcmBytes, true); // file size - 8
    view.setUint32(8, 0x57415645, false);  // "WAVE"

    // fmt sub-chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);          // sub-chunk size (PCM = 16)
    view.setUint16(20, 1, true);           // audio format (1 = PCM)
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // data sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, pcmBytes, true);

    // Copy PCM data after header
    new Uint8Array(wavBuffer, 44).set(new Uint8Array(pcmBuffer));

    return wavBuffer;
}
