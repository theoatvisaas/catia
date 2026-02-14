import AsyncStorage from "@react-native-async-storage/async-storage";
import { useConsultationStore } from "@/stores/consultation/useConsultationStore";
import type { RecordingSessionState } from "@/types/chunkTypes";

const LEGACY_KEY = "@catia:activeChunkSession";

/**
 * Migrates a legacy `RecordingSessionState` from AsyncStorage
 * into the new `useConsultationStore`.
 *
 * This handles users upgrading from the old chunk system to the
 * new consultation sync engine. After migration, the legacy key
 * is removed from AsyncStorage.
 *
 * Returns `true` if a session was migrated.
 */
export async function migrateLegacySession(): Promise<boolean> {
    try {
        const raw = await AsyncStorage.getItem(LEGACY_KEY);
        if (!raw) return false;

        const legacy = JSON.parse(raw) as RecordingSessionState;

        // Check if this session already exists in the new store
        const store = useConsultationStore.getState();
        if (store.getConsultation(legacy.sessionId)) {
            // Already migrated — just clean up the legacy key
            await AsyncStorage.removeItem(LEGACY_KEY);
            return false;
        }

        // Create consultation in new store
        store.createConsultation({
            sessionId: legacy.sessionId,
            userId: legacy.userId,
            patientName: legacy.patientName,
            guardianName: legacy.guardianName,
            sex: legacy.sex,
            bucket: legacy.bucket,
        });

        // Migrate chunks
        for (let i = 0; i < legacy.chunks.length; i++) {
            const chunk = legacy.chunks[i];

            store.addChunk(legacy.sessionId, {
                index: chunk.index,
                order: i,
                storagePath: chunk.storagePath,
                status: chunk.status === "uploaded" ? "uploaded" : "failed",
                sizeBytes: chunk.sizeBytes,
                retryCount: chunk.retryCount,
                streamPosition: chunk.streamPosition,
            });
        }

        // Set finalized state based on legacy
        store.updateConsultation(legacy.sessionId, {
            userFinalized: legacy.finalized,
            createdAt: legacy.startedAt,
            hasTempBuffer: !legacy.finalized,
        });

        store.recomputeSyncStatus(legacy.sessionId);

        // Remove legacy key
        await AsyncStorage.removeItem(LEGACY_KEY);

        console.log(
            `[MigrateLegacy] Migrated session ${legacy.sessionId}: ${legacy.chunks.length} chunks`
        );
        return true;
    } catch (err) {
        console.warn("[MigrateLegacy] Migration failed:", err);
        // Don't remove the legacy key on failure — retry next startup
        return false;
    }
}
