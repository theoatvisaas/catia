import { useConsultationStore } from "@/stores/consultation/useConsultationStore";
import { startNetworkMonitor, getNetworkStatus } from "../network/networkMonitor";
import { migrateLegacySession } from "./migrateLegacySession";
import { recoverCrashedSession, autoSyncAll } from "./consultationSyncService";

export type StartupRecoveryResult = {
    migratedLegacy: boolean;
    recoveredSessions: string[];
    autoSyncStarted: boolean;
};

/**
 * Runs once after the consultation store is hydrated.
 *
 * 1. Migrates legacy `@catia:activeChunkSession` if present
 * 2. Recovers crashed sessions (those with temp buffers)
 * 3. Starts the network monitor
 * 4. If online, kicks off autoSyncAll in background
 */
export async function runStartupRecovery(): Promise<StartupRecoveryResult> {
    const result: StartupRecoveryResult = {
        migratedLegacy: false,
        recoveredSessions: [],
        autoSyncStarted: false,
    };

    // 1. Migrate legacy session
    try {
        result.migratedLegacy = await migrateLegacySession();
    } catch (err) {
        console.warn("[StartupRecovery] Legacy migration error:", err);
    }

    // 2. Recover crashed sessions (have temp buffer but not finalized)
    const store = useConsultationStore.getState();
    const allConsultations = store.getAllConsultations();

    for (const consultation of allConsultations) {
        if (consultation.hasTempBuffer && !consultation.userFinalized) {
            try {
                const recovered = await recoverCrashedSession(consultation.sessionId);
                if (recovered) {
                    result.recoveredSessions.push(consultation.sessionId);
                }
            } catch (err) {
                console.warn(
                    `[StartupRecovery] Failed to recover session ${consultation.sessionId}:`,
                    err
                );
            }
        }
    }

    // 3. Start network monitor
    startNetworkMonitor();

    // 4. Auto-sync if online
    const network = getNetworkStatus();
    if (network.isConnected) {
        result.autoSyncStarted = true;
        // Run in background — don't block startup
        autoSyncAll().catch((err) =>
            console.warn("[StartupRecovery] Auto-sync error:", err)
        );
    }

    console.log("[StartupRecovery] Complete:", {
        migratedLegacy: result.migratedLegacy,
        recoveredCount: result.recoveredSessions.length,
        autoSyncStarted: result.autoSyncStarted,
    });

    return result;
}
