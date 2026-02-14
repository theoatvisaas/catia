/**
 * Data setup functions for test scenarios that need fake data in the store.
 *
 * These are used by the DevTestPanel for scenarios 6, 10, 11, and 15.
 * They create fake consultations to exercise the sync engine's recovery,
 * orphan detection, and guard logic.
 *
 * ⚠️ Only available in __DEV__ builds.
 */

import { ts } from "@/lib/logger";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system";
import { useConsultationStore } from "@/stores/consultation/useConsultationStore";
import { ensureChunkDir, saveChunkLocally, getTempBufferPath } from "@/services/recordings/chunkStorage";

const TAG = "[TestSimulators]";

/**
 * Generate a fake base64 string that decodes to ~960 bytes of silent PCM audio.
 * Uses all-zeros (silence) to avoid noise when played.
 */
function generateFakeBase64Pcm(sizeBytes: number): string {
    // Create a buffer of zeros
    const buffer = new Uint8Array(sizeBytes);
    // Convert to base64 manually (simple implementation for test data)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let result = "";
    for (let i = 0; i < buffer.length; i += 3) {
        const b0 = buffer[i];
        const b1 = i + 1 < buffer.length ? buffer[i + 1] : 0;
        const b2 = i + 2 < buffer.length ? buffer[i + 2] : 0;
        result += chars[(b0 >> 2) & 0x3f];
        result += chars[((b0 << 4) | (b1 >> 4)) & 0x3f];
        result += i + 1 < buffer.length ? chars[((b1 << 2) | (b2 >> 6)) & 0x3f] : "=";
        result += i + 2 < buffer.length ? chars[b2 & 0x3f] : "=";
    }
    return result;
}

// ── Scenario 6: Simulate crash recovery ────────────────────

/**
 * Creates a temp buffer file and marks the active consultation for crash recovery.
 * After calling this, close and reopen the app to trigger startupRecovery.
 *
 * @param sessionId - The active session to simulate crash on.
 *                     If null, creates a new fake session.
 */
export async function simulateCrashRecovery(sessionId: string | null): Promise<string> {
    const store = useConsultationStore.getState();

    let targetSessionId: string;

    if (sessionId) {
        const consultation = store.getConsultation(sessionId);
        if (!consultation) {
            throw new Error(`Session ${sessionId} not found`);
        }
        targetSessionId = sessionId;
    } else {
        // Create a new fake session
        targetSessionId = Crypto.randomUUID();
        store.createConsultation({
            sessionId: targetSessionId,
            userId: "test-user",
            patientName: "Crash Test Patient",
            guardianName: "Test Guardian",
            sex: "male",
            bucket: process.env.EXPO_PUBLIC_SUPABASE_BUCKET || "recordings",
        });
    }

    // Create a temp buffer file with some fake audio data
    await ensureChunkDir(targetSessionId);
    const tempPath = getTempBufferPath(targetSessionId);

    // Generate 10 lines of fake base64 PCM (~32KB each = ~320KB total)
    const fakeLines: string[] = [];
    for (let i = 0; i < 10; i++) {
        fakeLines.push(generateFakeBase64Pcm(32000));
    }

    await FileSystem.writeAsStringAsync(tempPath, fakeLines.join("\n"), {
        encoding: FileSystem.EncodingType.UTF8,
    });

    // Mark as having temp buffer and NOT finalized
    store.updateConsultation(targetSessionId, {
        hasTempBuffer: true,
        userFinalized: false,
    });

    console.log(
        `${ts(TAG)} simulateCrashRecovery() | ✅ Created temp buffer for ${targetSessionId} (${fakeLines.length} segments) | tempPath=${tempPath}`
    );

    return targetSessionId;
}

// ── Scenario 10: Create orphan session ─────────────────────

/**
 * Creates an orphan consultation with chunks that have no local data files.
 * This simulates a session that was partially created but the local chunk
 * files were lost (e.g., app cleared cache).
 */
export function createOrphanSession(): string {
    const store = useConsultationStore.getState();
    const sessionId = Crypto.randomUUID();

    store.createConsultation({
        sessionId,
        userId: "test-user",
        patientName: "Orphan Test Patient",
        guardianName: "Test Guardian",
        sex: "female",
        bucket: process.env.EXPO_PUBLIC_SUPABASE_BUCKET || "recordings",
    });

    // Add 3 chunks with pending_local status but NO local file paths
    for (let i = 0; i < 3; i++) {
        store.addChunk(sessionId, {
            index: i,
            order: i,
            storagePath: `test-user/recordings/${sessionId}/chunk_${String(i).padStart(4, "0")}.wav`,
            status: "pending_local",
            sizeBytes: 32000,
            retryCount: 0,
            streamPosition: i * 32000,
            // NO localFilePath — this is the key part
        });
    }

    // Mark as NOT finalized (user never pressed stop)
    store.updateConsultation(sessionId, {
        userFinalized: false,
        durationMs: 45000, // 45s fake duration
    });

    store.recomputeSyncStatus(sessionId);

    console.log(
        `${ts(TAG)} createOrphanSession() | ✅ Created orphan session ${sessionId} with 3 chunks (no local files)`
    );

    return sessionId;
}

// ── Scenario 11: Create multiple incomplete sessions ───────

/**
 * Creates 3 consultations with different sync states:
 * - Session A: "local" — 2 chunks pending, no data files
 * - Session B: "partial" — 3 uploaded + 2 pending with real local data
 * - Session C: "partial" — all chunks uploaded but DB finalization failed
 */
export async function createMultipleIncomplete(): Promise<string[]> {
    const store = useConsultationStore.getState();
    const bucket = process.env.EXPO_PUBLIC_SUPABASE_BUCKET || "recordings";
    const sessionIds: string[] = [];

    // ── Session A: fully local ──────────────────────────────
    const sessionA = Crypto.randomUUID();
    sessionIds.push(sessionA);

    store.createConsultation({
        sessionId: sessionA,
        userId: "test-user",
        patientName: "Local Test Patient",
        guardianName: "Guardian A",
        sex: "male",
        bucket,
    });

    for (let i = 0; i < 2; i++) {
        store.addChunk(sessionA, {
            index: i,
            order: i,
            storagePath: `test-user/recordings/${sessionA}/chunk_${String(i).padStart(4, "0")}.wav`,
            status: "pending_local",
            sizeBytes: 32000,
            retryCount: 0,
            streamPosition: i * 32000,
        });
    }

    store.updateConsultation(sessionA, {
        userFinalized: true,
        durationMs: 60000,
        finishedAt: Date.now() - 3600000, // 1h ago
    });
    store.recomputeSyncStatus(sessionA);

    // ── Session B: partial with real local data ─────────────
    const sessionB = Crypto.randomUUID();
    sessionIds.push(sessionB);

    store.createConsultation({
        sessionId: sessionB,
        userId: "test-user",
        patientName: "Partial Test Patient",
        guardianName: "Guardian B",
        sex: "female",
        bucket,
    });

    // 3 uploaded chunks
    for (let i = 0; i < 3; i++) {
        store.addChunk(sessionB, {
            index: i,
            order: i,
            storagePath: `test-user/recordings/${sessionB}/chunk_${String(i).padStart(4, "0")}.wav`,
            status: "uploaded",
            sizeBytes: 32000,
            retryCount: 0,
            streamPosition: i * 32000,
        });
    }

    // 2 pending chunks with real local files
    await ensureChunkDir(sessionB);
    for (let i = 3; i < 5; i++) {
        const fakeData = [generateFakeBase64Pcm(32000)];
        const localPath = await saveChunkLocally(sessionB, i, fakeData);

        store.addChunk(sessionB, {
            index: i,
            order: i,
            storagePath: `test-user/recordings/${sessionB}/chunk_${String(i).padStart(4, "0")}.wav`,
            status: "pending_local",
            sizeBytes: 32000,
            retryCount: 0,
            streamPosition: i * 32000,
            localFilePath: localPath,
        });
    }

    store.updateConsultation(sessionB, {
        userFinalized: true,
        durationMs: 150000,
        finishedAt: Date.now() - 1800000, // 30min ago
    });
    store.recomputeSyncStatus(sessionB);

    // ── Session C: all uploaded but DB failed ───────────────
    const sessionC = Crypto.randomUUID();
    sessionIds.push(sessionC);

    store.createConsultation({
        sessionId: sessionC,
        userId: "test-user",
        patientName: "DB Failed Test Patient",
        guardianName: "Guardian C",
        sex: "male",
        bucket,
    });

    for (let i = 0; i < 3; i++) {
        store.addChunk(sessionC, {
            index: i,
            order: i,
            storagePath: `test-user/recordings/${sessionC}/chunk_${String(i).padStart(4, "0")}.wav`,
            status: "uploaded",
            sizeBytes: 32000,
            retryCount: 0,
            streamPosition: i * 32000,
        });
    }

    store.updateConsultation(sessionC, {
        userFinalized: true,
        durationMs: 90000,
        finishedAt: Date.now() - 7200000, // 2h ago
        lastError: "DB finalization failed (simulated)",
    });
    store.recomputeSyncStatus(sessionC);

    console.log(
        `${ts(TAG)} createMultipleIncomplete() | ✅ Created 3 sessions: A=${sessionA} (local), B=${sessionB} (partial), C=${sessionC} (partial/db-failed)`
    );

    return sessionIds;
}

// ── Scenario 15: Create active (non-finalized) session ─────

/**
 * Creates a consultation that appears as an active recording (not finalized).
 * Used to test the guard in RecordProvider.start() that auto-finalizes
 * previous sessions before starting a new one.
 */
export function createActiveSession(): string {
    const store = useConsultationStore.getState();
    const sessionId = Crypto.randomUUID();

    store.createConsultation({
        sessionId,
        userId: "test-user",
        patientName: "Active Test Patient",
        guardianName: "Test Guardian",
        sex: "male",
        bucket: process.env.EXPO_PUBLIC_SUPABASE_BUCKET || "recordings",
    });

    // Add 1 chunk pending_local
    store.addChunk(sessionId, {
        index: 0,
        order: 0,
        storagePath: `test-user/recordings/${sessionId}/chunk_0000.wav`,
        status: "pending_local",
        sizeBytes: 32000,
        retryCount: 0,
        streamPosition: 0,
    });

    // NOT finalized — this is the key
    store.updateConsultation(sessionId, {
        userFinalized: false,
        durationMs: 30000,
    });

    store.recomputeSyncStatus(sessionId);

    console.log(
        `${ts(TAG)} createActiveSession() | ✅ Created active (non-finalized) session ${sessionId}`
    );

    return sessionId;
}

// ── Scenario 7: Check local files ──────────────────────────

/**
 * Lists all chunk directories and files on disk.
 * Used to verify cleanup after sync.
 */
export async function checkLocalFiles(): Promise<string[]> {
    const baseDir = `${FileSystem.documentDirectory}chunks/`;
    const results: string[] = [];

    try {
        const info = await FileSystem.getInfoAsync(baseDir);
        if (!info.exists) {
            results.push("No chunks directory found (clean)");
            console.log(`${ts(TAG)} checkLocalFiles() | ${results[0]}`);
            return results;
        }

        const sessions = await FileSystem.readDirectoryAsync(baseDir);
        results.push(`Found ${sessions.length} session director${sessions.length === 1 ? "y" : "ies"}:`);

        for (const session of sessions) {
            const sessionPath = `${baseDir}${session}/`;
            try {
                const files = await FileSystem.readDirectoryAsync(sessionPath);
                results.push(`  ${session}/ — ${files.length} file(s): ${files.join(", ")}`);
            } catch {
                results.push(`  ${session}/ — unable to read`);
            }
        }
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push(`Error reading chunks directory: ${msg}`);
    }

    console.log(`${ts(TAG)} checkLocalFiles() |`, results.join("\n"));
    return results;
}
