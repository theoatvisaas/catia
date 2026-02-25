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
    /** When true, shows "Paciente Exemplo" badge (violet) */
    isExample?: boolean;
};

const STATUS_CONFIG: Record<
    ConsultationSyncStatus,
    { label: string; bg: string; fg: string }
> = {
    local: {
        label: "Envio pendente",
        bg: "#FEE2E2",
        fg: colors.error,
    },
    partial: {
        label: "Envio incompleto",
        bg: "#FEE2E2",
        fg: colors.error,
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

export function SyncStatusBadge({ status, uploadedChunks, totalChunks, interrupted, isExample }: Props) {
    // Example consultation — show violet "Paciente Exemplo" badge
    if (isExample) {
        return (
            <View style={[styles.badge, { backgroundColor: "#EDE9FE" }]}>
                <Text style={[styles.text, { color: "#7C3AED" }]}>Paciente Exemplo</Text>
            </View>
        );
    }

    // Synced is the normal state — no badge needed
    if (status === "synced" && !interrupted) return null;

    // Interrupted recording takes priority over sync status
    if (interrupted) {
        return (
            <View style={[styles.badge, { backgroundColor: "#FEE2E2" }]}>
                <Text style={[styles.text, { color: colors.error }]}>Gravação interrompida</Text>
            </View>
        );
    }

    const config = STATUS_CONFIG[status];

    return (
        <View style={[styles.badge, { backgroundColor: config.bg }]}>
            <Text style={[styles.text, { color: config.fg }]}>{config.label}</Text>
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
