/**
 * Dev Test Panel — UI for toggling test flags and running data setup actions.
 *
 * Only rendered in __DEV__ builds. Displays in the Settings screen.
 * Uses mutable testFlags object — no React state for flags (avoids re-renders).
 * The panel uses a forceUpdate counter to re-render when flags change.
 */

import { ts } from "@/lib/logger";
import React, { useCallback, useState } from "react";
import {
    Alert,
    Pressable,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";

import { colors } from "@/styles/theme/colors";
import {
    testFlags,
    setTestFlag,
    resetAllTestFlags,
    getActiveFlagsSummary,
} from "@/config/testFlags";
import type { TestFlagsType } from "@/config/testFlags";
import {
    simulateCrashRecovery,
    createOrphanSession,
    createMultipleIncomplete,
    createActiveSession,
    checkLocalFiles,
} from "@/config/testSimulators";
import { useConsultationStore } from "@/stores/consultation/useConsultationStore";

const TAG = "[DevTestPanel]";

// ── Toggle Row ──────────────────────────────────────────────

type ToggleRowProps = {
    label: string;
    scenario: string;
    flagKey: keyof TestFlagsType;
    onUpdate: () => void;
};

function ToggleRow({ label, scenario, flagKey, onUpdate }: ToggleRowProps) {
    const value = testFlags[flagKey] as boolean;
    return (
        <View style={styles.toggleRow}>
            <View style={styles.toggleLabelWrap}>
                <Text style={styles.scenarioTag}>{scenario}</Text>
                <Text style={styles.toggleLabel}>{label}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={(v) => {
                    setTestFlag(flagKey, v);
                    onUpdate();
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.primaryWhite}
            />
        </View>
    );
}

// ── Action Button ───────────────────────────────────────────

type ActionButtonProps = {
    label: string;
    scenario: string;
    onPress: () => void | Promise<void>;
};

function ActionButton({ label, scenario, onPress }: ActionButtonProps) {
    const [loading, setLoading] = useState(false);

    const handlePress = async () => {
        setLoading(true);
        try {
            await onPress();
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Pressable
            style={[styles.actionButton, loading && styles.actionButtonDisabled]}
            onPress={handlePress}
            disabled={loading}
        >
            <Text style={styles.scenarioTag}>{scenario}</Text>
            <Text style={styles.actionButtonText}>
                {loading ? "..." : label}
            </Text>
        </Pressable>
    );
}

// ── Main Component ──────────────────────────────────────────

export function DevTestPanel() {
    // Force re-render counter (since testFlags is mutable, not reactive)
    const [, setRenderCount] = useState(0);
    const forceUpdate = useCallback(() => setRenderCount((c) => c + 1), []);

    // Chunk index input state
    const [chunkIndexText, setChunkIndexText] = useState(
        testFlags.failChunkAtIndex !== null ? String(testFlags.failChunkAtIndex) : ""
    );

    const activeFlags = getActiveFlagsSummary();

    const activeSession = useConsultationStore.getState().getActiveRecording();

    return (
        <View style={styles.container}>
            {/* ── Header ─────────────────────────────────────── */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>DEV TEST PANEL</Text>
                {activeFlags.length > 0 && (
                    <Text style={styles.headerActiveFlags}>
                        Active: {activeFlags.join(" · ")}
                    </Text>
                )}
                {activeFlags.length === 0 && (
                    <Text style={styles.headerInactive}>No flags active</Text>
                )}
            </View>

            {/* ── Recording Failures ─────────────────────────── */}
            <Text style={styles.sectionTitle}>Recording Failures</Text>

            <ToggleRow
                scenario="1"
                label="Deny mic permission"
                flagKey="denyMicPermission"
                onUpdate={forceUpdate}
            />
            <ToggleRow
                scenario="2/13"
                label="Kill audio stream"
                flagKey="killAudioStream"
                onUpdate={forceUpdate}
            />
            <ToggleRow
                scenario="3"
                label="Fail disk write"
                flagKey="failDiskWrite"
                onUpdate={forceUpdate}
            />
            <ToggleRow
                scenario="12"
                label="Simulate disk full"
                flagKey="simulateDiskFull"
                onUpdate={forceUpdate}
            />
            <ToggleRow
                scenario="N"
                label="Deny notification permission"
                flagKey="denyNotificationPermission"
                onUpdate={forceUpdate}
            />

            {/* ── Network & Upload ──────────────────────────── */}
            <Text style={styles.sectionTitle}>Network & Upload</Text>

            <ToggleRow
                scenario="4"
                label="Simulate offline"
                flagKey="simulateOffline"
                onUpdate={forceUpdate}
            />

            {/* Scenario 5: chunk index input */}
            <View style={styles.toggleRow}>
                <View style={styles.toggleLabelWrap}>
                    <Text style={styles.scenarioTag}>5</Text>
                    <Text style={styles.toggleLabel}>Fail at chunk #</Text>
                </View>
                <View style={styles.chunkIndexInput}>
                    <TextInput
                        style={styles.chunkIndexTextInput}
                        value={chunkIndexText}
                        onChangeText={(text) => {
                            setChunkIndexText(text);
                            const num = parseInt(text, 10);
                            if (!isNaN(num) && num >= 0) {
                                setTestFlag("failChunkAtIndex", num);
                            } else if (text === "") {
                                setTestFlag("failChunkAtIndex", null);
                            }
                            forceUpdate();
                        }}
                        keyboardType="number-pad"
                        placeholder="off"
                        placeholderTextColor={colors.textDisabled}
                    />
                </View>
            </View>

            <ToggleRow
                scenario="8"
                label="Corrupt upload"
                flagKey="simulateCorruptUpload"
                onUpdate={forceUpdate}
            />
            <ToggleRow
                scenario="9"
                label="Duplicate upload"
                flagKey="simulateDuplicateUpload"
                onUpdate={forceUpdate}
            />
            <ToggleRow
                scenario="14"
                label="Token expired"
                flagKey="simulateTokenExpired"
                onUpdate={forceUpdate}
            />

            {/* ── Data Setup Actions ────────────────────────── */}
            <Text style={styles.sectionTitle}>Data Setup Actions</Text>

            <ActionButton
                scenario="6"
                label="Simulate Crash Recovery"
                onPress={async () => {
                    const sid = activeSession?.sessionId ?? null;
                    const targetId = await simulateCrashRecovery(sid);
                    Alert.alert(
                        "Crash Simulated",
                        `Session: ${targetId.slice(0, 8)}...\n\nClose and reopen the app to trigger recovery.`
                    );
                }}
            />

            <ActionButton
                scenario="10"
                label="Create Orphan Session"
                onPress={() => {
                    const sid = createOrphanSession();
                    Alert.alert(
                        "Orphan Created",
                        `Session: ${sid.slice(0, 8)}...\n\nGo to History to see it.`
                    );
                }}
            />

            <ActionButton
                scenario="11"
                label="Create Multiple Incomplete"
                onPress={async () => {
                    const ids = await createMultipleIncomplete();
                    Alert.alert(
                        "3 Sessions Created",
                        `A: ${ids[0].slice(0, 8)}... (local)\nB: ${ids[1].slice(0, 8)}... (partial)\nC: ${ids[2].slice(0, 8)}... (db-failed)\n\nGo to History to see them.`
                    );
                }}
            />

            <ActionButton
                scenario="15"
                label="Create Active Session"
                onPress={() => {
                    const sid = createActiveSession();
                    Alert.alert(
                        "Active Session Created",
                        `Session: ${sid.slice(0, 8)}...\n\nTry starting a new recording — it should auto-finalize this one.`
                    );
                }}
            />

            {/* ── Verification ────────────────────────────── */}
            <Text style={styles.sectionTitle}>Verification</Text>

            <ActionButton
                scenario="7"
                label="Check Local Files"
                onPress={async () => {
                    const results = await checkLocalFiles();
                    Alert.alert("Local Files", results.join("\n"));
                }}
            />

            <ActionButton
                scenario="N"
                label="Send Test Notification"
                onPress={async () => {
                    const { sendLocalNotification } = require("@/services/notifications/notificationService");
                    await sendLocalNotification({
                        title: "Teste CatIA",
                        body: "Esta é uma notificação de teste.",
                    });
                    Alert.alert("Enviada", "Verifique a barra de notificações.");
                }}
            />

            {/* ── Reset ────────────────────────────────────── */}
            <Pressable
                style={styles.resetButton}
                onPress={() => {
                    resetAllTestFlags();
                    setChunkIndexText("");
                    forceUpdate();
                    console.log(`${ts(TAG)} All flags reset`);
                }}
            >
                <Text style={styles.resetButtonText}>Reset All Flags</Text>
            </Pressable>
        </View>
    );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
    },
    header: {
        backgroundColor: colors.warningSurface,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.textPrimary,
        letterSpacing: 1,
    },
    headerActiveFlags: {
        fontSize: 11,
        color: colors.textPrimary,
        marginTop: 4,
        fontWeight: "500",
    },
    headerInactive: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginTop: 16,
        marginBottom: 8,
    },
    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    toggleLabelWrap: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 8,
    },
    scenarioTag: {
        fontSize: 10,
        fontWeight: "700",
        color: colors.primaryWhite,
        backgroundColor: colors.primary,
        borderRadius: 4,
        paddingHorizontal: 5,
        paddingVertical: 1,
        overflow: "hidden",
        minWidth: 22,
        textAlign: "center",
    },
    toggleLabel: {
        fontSize: 13,
        color: colors.textPrimary,
    },
    chunkIndexInput: {
        width: 60,
    },
    chunkIndexTextInput: {
        fontSize: 13,
        color: colors.textPrimary,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        textAlign: "center",
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 6,
    },
    actionButtonDisabled: {
        opacity: 0.5,
    },
    actionButtonText: {
        fontSize: 13,
        color: colors.textPrimary,
        fontWeight: "500",
    },
    resetButton: {
        marginTop: 20,
        backgroundColor: colors.error,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
    },
    resetButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.primaryWhite,
    },
});
