import { ts } from "@/lib/logger";

/**
 * Test flags for simulating failure scenarios in DEV mode.
 *
 * ⚠️ These flags are ONLY available in __DEV__ builds.
 * In production, the `require("@/config/testFlags")` calls inside
 * `if (__DEV__)` blocks are tree-shaken by the bundler.
 *
 * Usage pattern (in service/provider files):
 * ```ts
 * if (__DEV__) {
 *     const { testFlags } = require("@/config/testFlags");
 *     if (testFlags.flagName) {
 *         console.log("[TEST] Simulated: ...");
 *         // simulated behavior
 *     }
 * }
 * ```
 */

const TAG = "[TestFlags]";

export type TestFlagsType = {
    // ── Recording Failures ────────────────────────────────
    /** Scenario 1: Simulate denied microphone permission */
    denyMicPermission: boolean;
    /** Scenarios 2 & 13: Kill audio stream (watchdog fires after 5s) */
    killAudioStream: boolean;
    /** Scenario 3: Simulate disk write error in buffer persistence */
    failDiskWrite: boolean;
    /** Scenario 12: Simulate disk full (low space) */
    simulateDiskFull: boolean;

    // ── Network & Upload ──────────────────────────────────
    /** Scenario 4: Simulate offline (no network connection) */
    simulateOffline: boolean;
    /** Scenario 5: Fail upload at specific chunk index (null = disabled) */
    failChunkAtIndex: number | null;
    /** Scenario 8: Simulate corrupt upload (upload throws before sending) */
    simulateCorruptUpload: boolean;
    /** Scenario 9: Simulate duplicate upload (force-mark as uploaded before guard) */
    simulateDuplicateUpload: boolean;
    /** Scenario 14: Simulate expired auth token */
    simulateTokenExpired: boolean;

    // ── Notifications ───────────────────────────────────────
    /** Simulate denied notification permission */
    denyNotificationPermission: boolean;
};

/** Mutable flag object — no React state, no re-renders. */
export const testFlags: TestFlagsType = {
    denyMicPermission: false,
    killAudioStream: false,
    failDiskWrite: false,
    simulateDiskFull: false,
    simulateOffline: false,
    failChunkAtIndex: null,
    simulateCorruptUpload: false,
    simulateDuplicateUpload: false,
    simulateTokenExpired: false,
    denyNotificationPermission: false,
};

/** Set a single flag value */
export function setTestFlag<K extends keyof TestFlagsType>(
    key: K,
    value: TestFlagsType[K]
): void {
    console.log(`${ts(TAG)} setTestFlag(${key}) = ${JSON.stringify(value)}`);
    testFlags[key] = value;
}

/** Reset all flags to default values */
export function resetAllTestFlags(): void {
    console.log(`${ts(TAG)} resetAllTestFlags()`);
    testFlags.denyMicPermission = false;
    testFlags.killAudioStream = false;
    testFlags.failDiskWrite = false;
    testFlags.simulateDiskFull = false;
    testFlags.simulateOffline = false;
    testFlags.failChunkAtIndex = null;
    testFlags.simulateCorruptUpload = false;
    testFlags.simulateDuplicateUpload = false;
    testFlags.simulateTokenExpired = false;
    testFlags.denyNotificationPermission = false;
}

/** Get a summary of all currently active flags */
export function getActiveFlagsSummary(): string[] {
    const active: string[] = [];

    if (testFlags.denyMicPermission) active.push("1. Mic denied");
    if (testFlags.killAudioStream) active.push("2/13. Kill stream");
    if (testFlags.failDiskWrite) active.push("3. Disk write fail");
    if (testFlags.simulateDiskFull) active.push("12. Disk full");
    if (testFlags.simulateOffline) active.push("4. Offline");
    if (testFlags.failChunkAtIndex !== null)
        active.push(`5. Fail chunk #${testFlags.failChunkAtIndex}`);
    if (testFlags.simulateCorruptUpload) active.push("8. Corrupt upload");
    if (testFlags.simulateDuplicateUpload) active.push("9. Duplicate upload");
    if (testFlags.simulateTokenExpired) active.push("14. Token expired");
    if (testFlags.denyNotificationPermission) active.push("Notif denied");

    return active;
}
