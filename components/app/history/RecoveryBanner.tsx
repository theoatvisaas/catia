import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/styles/theme/colors";
import { autoSyncAll } from "@/services/recordings/consultationSyncService";
import { useConsultationRecovery } from "@/providers/ConsultationProvider";

export function RecoveryBanner() {
    const { recoveryNeeded, crashedSessions, dismissRecovery } = useConsultationRecovery();
    const [syncing, setSyncing] = useState(false);

    if (!recoveryNeeded) return null;

    const handleSyncAll = async () => {
        setSyncing(true);
        try {
            await autoSyncAll();
        } catch (err) {
            console.warn("[RecoveryBanner] Sync failed:", err);
        } finally {
            setSyncing(false);
            dismissRecovery();
        }
    };

    return (
        <View style={styles.banner}>
            <Text style={styles.title}>
                {crashedSessions.length === 1
                    ? "1 sessao recuperada"
                    : `${crashedSessions.length} sessoes recuperadas`}
            </Text>
            <Text style={styles.subtitle}>
                Dados de audio foram encontrados de sessoes anteriores.
            </Text>

            <View style={styles.actions}>
                <Pressable style={styles.syncButton} onPress={handleSyncAll} disabled={syncing}>
                    {syncing ? (
                        <ActivityIndicator size="small" color={colors.onPrimary} />
                    ) : (
                        <Text style={styles.syncText}>Sincronizar tudo</Text>
                    )}
                </Pressable>

                <Pressable style={styles.dismissButton} onPress={dismissRecovery}>
                    <Text style={styles.dismissText}>Depois</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        marginHorizontal: 16,
        marginTop: 8,
        padding: 16,
        backgroundColor: colors.warningRecord,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.warningSurface,
    },
    title: {
        fontSize: 14,
        fontWeight: "700",
        color: "#92600F",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: "#92600F",
        marginBottom: 12,
    },
    actions: {
        flexDirection: "row",
        gap: 8,
    },
    syncButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    syncText: {
        color: colors.onPrimary,
        fontSize: 13,
        fontWeight: "600",
    },
    dismissButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    dismissText: {
        color: "#92600F",
        fontSize: 13,
        fontWeight: "600",
    },
});
