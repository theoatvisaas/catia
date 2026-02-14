import { RecoveryBanner } from "@/components/app/history/RecoveryBanner";
import { SyncStatusBadge } from "@/components/app/history/SyncStatusBadge";
import { t } from "@/i18n";
import { useConsultationStore } from "@/stores/consultation/useConsultationStore";
import { retrySyncConsultation, finalizeConsultation, discardConsultation } from "@/services/recordings/consultationSyncService";
import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";
import React, { useCallback, useMemo, useState } from "react";
import { ActionSheetIOS, Alert, FlatList, Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Consultation } from "@/types/consultationTypes";

// ── Helpers ─────────────────────────────────────────────────

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

function formatTime(ts: number) {
    const d = new Date(ts);
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function formatDuration(ms: number) {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${pad2(s)}s`;
}

function formatDateLabel(ts: number) {
    const d = new Date(ts);
    return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).toUpperCase();
}

type DateGroup = {
    dateKey: string;
    dateLabel: string;
    items: Consultation[];
};

function groupByDate(consultations: Consultation[]): DateGroup[] {
    const map = new Map<string, DateGroup>();

    for (const c of consultations) {
        const d = new Date(c.createdAt);
        const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

        if (!map.has(key)) {
            map.set(key, {
                dateKey: key,
                dateLabel: formatDateLabel(c.createdAt),
                items: [],
            });
        }
        map.get(key)!.items.push(c);
    }

    return Array.from(map.values());
}

// ── Component ───────────────────────────────────────────────

export default function History() {
    const insets = useSafeAreaInsets();
    const consultationsMap = useConsultationStore((s) => s.consultations);
    const [syncing, setSyncing] = useState<string | null>(null);

    // Derive sorted list and filter out discarded
    const visible = useMemo(
        () =>
            Object.values(consultationsMap)
                .filter((c) => c.syncStatus !== "discarded")
                .sort((a, b) => b.createdAt - a.createdAt),
        [consultationsMap]
    );

    const groups = useMemo(() => groupByDate(visible), [visible]);

    const handleItemPress = useCallback(
        (consultation: Consultation) => {
            if (consultation.syncStatus === "synced") {
                // TODO: Navigate to detail/transcription screen
                // router.push(`/history/${consultation.sessionId}`);
                return;
            }

            // Show action options for local/partial
            const actions = ["Sincronizar", "Descartar", "Cancelar"];

            if (Platform.OS === "ios") {
                ActionSheetIOS.showActionSheetWithOptions(
                    {
                        options: actions,
                        destructiveButtonIndex: 1,
                        cancelButtonIndex: 2,
                        title: consultation.patientName || "Consulta",
                    },
                    async (index) => {
                        if (index === 0) await handleSync(consultation.sessionId);
                        if (index === 1) await handleDiscard(consultation.sessionId);
                    }
                );
            } else {
                Alert.alert(
                    consultation.patientName || "Consulta",
                    "O que deseja fazer com esta consulta?",
                    [
                        { text: "Cancelar", style: "cancel" },
                        {
                            text: "Descartar",
                            style: "destructive",
                            onPress: () => handleDiscard(consultation.sessionId),
                        },
                        {
                            text: "Sincronizar",
                            onPress: () => handleSync(consultation.sessionId),
                        },
                    ]
                );
            }
        },
        []
    );

    const handleSync = async (sessionId: string) => {
        setSyncing(sessionId);
        try {
            const allDone = await retrySyncConsultation(sessionId);
            if (allDone) {
                await finalizeConsultation(sessionId);
            }
        } catch (err) {
            console.warn("[History] Sync failed:", err);
        } finally {
            setSyncing(null);
        }
    };

    const handleDiscard = async (sessionId: string) => {
        try {
            await discardConsultation(sessionId);
        } catch (err) {
            console.warn("[History] Discard failed:", err);
        }
    };

    const buildDescription = (c: Consultation): string => {
        const parts: string[] = [];
        if (c.durationMs > 0) parts.push(formatDuration(c.durationMs));
        if (c.guardianName) parts.push(c.guardianName);
        if (c.chunks.length > 0) parts.push(`${c.chunks.length} chunks`);
        return parts.join(" - ") || "Consulta";
    };

    return (
        <View style={globalStyles.historyScreen}>
            <View style={[globalStyles.historyHeader, { paddingTop: Math.max(insets.top, 10) }]}>
                <Text style={globalStyles.historyHeaderTitle}>{t("history", "headerTitle")}</Text>
            </View>

            <FlatList
                data={groups}
                keyExtractor={(g) => g.dateKey}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={globalStyles.historyContent}
                style={globalStyles.historyScroll}
                ListHeaderComponent={<RecoveryBanner />}
                ListEmptyComponent={
                    <View style={{ padding: 32, alignItems: "center" }}>
                        <Text style={{ color: colors.textTertiary, fontSize: 14 }}>
                            Nenhuma consulta registrada
                        </Text>
                    </View>
                }
                renderItem={({ item: group }) => (
                    <View style={globalStyles.historyGroupCard}>
                        <View style={globalStyles.historyGroupTopStrip}>
                            <Text style={globalStyles.historyGroupTopStripText}>
                                {group.dateLabel}
                            </Text>
                        </View>

                        {group.items.map((consultation, idx) => {
                            const uploaded = consultation.chunks.filter(
                                (c) => c.status === "uploaded"
                            ).length;

                            return (
                                <View key={consultation.sessionId}>
                                    <Pressable
                                        onPress={() => handleItemPress(consultation)}
                                        style={({ pressed }) => [
                                            globalStyles.historyItem,
                                            pressed && globalStyles.historyItemPressed,
                                        ]}
                                    >
                                        <View style={globalStyles.historyItemTopRow}>
                                            <View style={globalStyles.historyItemLeftTop}>
                                                <Text style={globalStyles.historyItemTitle}>
                                                    {consultation.patientName || "Paciente nao identificado"}
                                                </Text>

                                                <SyncStatusBadge
                                                    status={consultation.syncStatus}
                                                    uploadedChunks={uploaded}
                                                    totalChunks={consultation.chunks.length}
                                                />
                                            </View>

                                            <Text style={globalStyles.historyItemTime}>
                                                {formatTime(consultation.createdAt)}
                                            </Text>
                                        </View>

                                        <Text
                                            style={globalStyles.historyItemSubtitle}
                                            numberOfLines={2}
                                        >
                                            {buildDescription(consultation)}
                                        </Text>

                                        {syncing === consultation.sessionId && (
                                            <Text
                                                style={[
                                                    globalStyles.historyItemSubtitle,
                                                    { color: colors.primary, marginTop: 4 },
                                                ]}
                                            >
                                                Sincronizando...
                                            </Text>
                                        )}
                                    </Pressable>

                                    {idx < group.items.length - 1 && (
                                        <View style={globalStyles.historyDivider} />
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}
            />
        </View>
    );
}
