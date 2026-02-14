/**
 * @deprecated This file is superseded by consultationSyncService.ts + startupRecovery.ts.
 * Kept only for reference during migration period.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { getAuthenticatedSupabase } from "@/lib/supabase/supabase";
import { uploadChunkBase64 } from "./uploadChunkBase64";
import type { RecordingSessionState } from "@/types/chunkTypes";

/** Legacy fallback path for sessions without a sessionId */
const LEGACY_TEMP_PATH = `${FileSystem.documentDirectory}chunks/buffer_temp.b64`;

const SESSION_STORAGE_KEY = "@catia:activeChunkSession";

/**
 * Check if there is an incomplete recording session from a previous crash/kill.
 * Returns the session state if found and not yet finalized, null otherwise.
 */
export async function checkForIncompleteSession(): Promise<RecordingSessionState | null> {
    const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    try {
        const session = JSON.parse(raw) as RecordingSessionState;

        if (session.finalized) {
            await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
            await deleteTempBufferFile();
            return null;
        }

        // Session exists and was NOT finalized = crash/kill during recording
        return session;
    } catch {
        await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
    }
}

/**
 * Try to recover and upload the temp buffer file that was being written to disk
 * between flush intervals. This contains the last 0-29 seconds of audio
 * that hadn't been flushed to a chunk yet.
 *
 * Returns the number of the chunk that was uploaded, or null if nothing to recover.
 */
export async function recoverTempBuffer(
    session: RecordingSessionState
): Promise<{ storagePath: string; sizeBytes: number } | null> {
    try {
        const info = await FileSystem.getInfoAsync(LEGACY_TEMP_PATH);
        if (!info.exists || info.size === 0) return null;

        // Read the temp file — it contains newline-separated base64 PCM chunks
        const raw = await FileSystem.readAsStringAsync(LEGACY_TEMP_PATH, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        if (!raw || raw.trim().length === 0) return null;

        // Split into individual base64 strings (each decoded separately to avoid padding corruption)
        const base64Chunks = raw.split("\n").filter((line) => line.length > 0);

        // Determine the next chunk index (after all already uploaded chunks)
        const nextIndex = session.chunks.length;
        const storagePath = `${session.storagePrefix}/chunk_${String(nextIndex).padStart(4, "0")}.wav`;

        await uploadChunkBase64({
            base64Chunks,
            bucket: session.bucket,
            storagePath,
        });

        const totalBase64Len = base64Chunks.reduce((sum, s) => sum + s.length, 0);
        const sizeBytes = Math.ceil((totalBase64Len * 3) / 4);

        console.log(
            `[SessionRecovery] Recovered temp buffer: ${base64Chunks.length}s of audio → ${storagePath} (${sizeBytes} bytes)`
        );

        // Clean up temp file after successful upload
        await deleteTempBufferFile();

        return { storagePath, sizeBytes };
    } catch (err) {
        console.warn("[SessionRecovery] Failed to recover temp buffer:", err);
        return null;
    }
}

/**
 * Mark an incomplete session as "partial" and save metadata.
 * Optionally recovers the temp buffer before finalizing.
 */
export async function finalizePartialSession(
    session: RecordingSessionState,
    durationMs: number
): Promise<void> {
    // Try to recover the temp buffer first
    const recovered = await recoverTempBuffer(session);

    const uploadedChunks = session.chunks.filter((c) => c.status === "uploaded");
    const totalChunks = uploadedChunks.length + (recovered ? 1 : 0);

    const supabase = await getAuthenticatedSupabase();
    const { error } = await supabase.from("recording_sessions").insert({
        session_id: session.sessionId,
        user_id: session.userId,
        storage_bucket: session.bucket,
        storage_prefix: session.storagePrefix,
        patient_name: session.patientName,
        guardian_name: session.guardianName,
        sex: session.sex,
        duration_ms: durationMs,
        chunk_count: totalChunks,
        status: "partial",
        finalized_at: new Date().toISOString(),
    });

    if (error) {
        console.error("[SessionRecovery] Failed to save partial session:", error);
        throw error;
    }

    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
    console.log(
        `[SessionRecovery] Partial session saved: ${totalChunks} chunks (${recovered ? "incl. recovered buffer" : "no buffer to recover"}), ~${durationMs}ms`
    );
}

/**
 * Discard an incomplete session: delete uploaded chunks from Storage
 * and remove the session from AsyncStorage.
 */
export async function discardIncompleteSession(
    session: RecordingSessionState
): Promise<void> {
    const pathsToDelete = session.chunks
        .filter((c) => c.status === "uploaded")
        .map((c) => c.storagePath);

    if (pathsToDelete.length > 0) {
        const supabase = await getAuthenticatedSupabase();
        const { error } = await supabase.storage
            .from(session.bucket)
            .remove(pathsToDelete);

        if (error) {
            console.warn("[SessionRecovery] Failed to delete some chunks:", error);
        } else {
            console.log(`[SessionRecovery] Deleted ${pathsToDelete.length} chunks from Storage`);
        }
    }

    await deleteTempBufferFile();
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
}

// ── Helpers ───────────────────────────────────────────────

async function deleteTempBufferFile(): Promise<void> {
    try {
        const info = await FileSystem.getInfoAsync(LEGACY_TEMP_PATH);
        if (info.exists) {
            await FileSystem.deleteAsync(LEGACY_TEMP_PATH, { idempotent: true });
        }
    } catch {
        // ignore
    }
}
