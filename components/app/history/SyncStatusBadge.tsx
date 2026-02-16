import React from "react";
import { Text, View, StyleSheet } from "react-native";
import type { ConsultationSyncStatus } from "@/types/consultationTypes";
import { colors } from "@/styles/theme/colors";

type Props = {
    status: ConsultationSyncStatus;
    uploadedChunks?: number;
    totalChunks?: number;
    /** When true, shows "Gravação interrompida" badge instead of sync status */
    interrupted?: boolean;
};

const STATUS_CONFIG: Record<
    ConsultationSyncStatus,
    { label: string; bg: string; fg: string }
> = {
    local: {
        label: "Somente local",
        bg: colors.surfaceMuted,
        fg: colors.textTertiary,
    },
    partial: {
        label: "Parcial",
        bg: colors.warningRecord,
        fg: "#92600F",
    },
    synced: {
        label: "Sincronizado",
        bg: "#DCFCE7",
        fg: "#166534",
    },
    discarded: {
        label: "Descartada",
        bg: "#FEE2E2",
        fg: colors.error,
    },
};

export function SyncStatusBadge({ status, uploadedChunks, totalChunks, interrupted }: Props) {
    // Interrupted recording takes priority over sync status
    if (interrupted) {
        return (
            <View style={[styles.badge, { backgroundColor: "#FEE2E2" }]}>
                <Text style={[styles.text, { color: colors.error }]}>Gravação interrompida</Text>
            </View>
        );
    }

    const config = STATUS_CONFIG[status];

    const label =
        status === "partial" && uploadedChunks != null && totalChunks != null
            ? `${config.label} (${uploadedChunks}/${totalChunks})`
            : config.label;

    return (
        <View style={[styles.badge, { backgroundColor: config.bg }]}>
            <Text style={[styles.text, { color: config.fg }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        borderRadius: 999,
        paddingVertical: 3,
        paddingHorizontal: 8,
    },
    text: {
        fontSize: 10,
        fontWeight: "600",
    },
});
