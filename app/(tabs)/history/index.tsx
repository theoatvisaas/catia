import { RecoveryBanner } from "@/components/app/history/RecoveryBanner";
import { SyncStatusBadge } from "@/components/app/history/SyncStatusBadge";
import { useExampleConsultations } from "@/hooks/useExampleConsultations";
import { showToast } from "@/providers/ToastProvider";
import { useRemoteConsultations } from "@/hooks/useRemoteConsultations";
import { t } from "@/i18n";
import { retrySyncConsultation, finalizeConsultation } from "@/services/recordings/consultationSyncService";
import { useConsultationStore } from "@/stores/consultation/useConsultationStore";
import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";
import type { DisplayConsultation } from "@/types/consultationTypes";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

/** Returns the correct timestamp for sorting/grouping a DisplayConsultation */
function getTimestamp(c: DisplayConsultation): number {
    return c.createdAt;
}

type DateGroup = {
    dateKey: string;
    dateLabel: string;
    items: DisplayConsultation[];
};

function groupByDate(consultations: DisplayConsultation[]): DateGroup[] {
    const map = new Map<string, DateGroup>();

    for (const c of consultations) {
        const ts = getTimestamp(c);
        const d = new Date(ts);
        const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

        if (!map.has(key)) {
            map.set(key, {
                dateKey: key,
                dateLabel: formatDateLabel(ts),
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
    const router = useRouter();
    const consultationsMap = useConsultationStore((s) => s.consultations);
    const [syncing, setSyncing] = useState<string | null>(null);

    // Remote consultations (paginated from Supabase)
    const remote = useRemoteConsultations();

    // Example consultations (for new users)
    const examples = useExampleConsultations();

    // Refresh remote list + load examples every time the History tab gains focus
    useFocusEffect(
        useCallback(() => {
            remote.refresh();
            examples.load();
        }, [])
    );

    // Remote session IDs for deduplication
    const remoteIds = useMemo(
        () => new Set(remote.items.map((r) => r.sessionId)),
        [remote.items]
    );

    // Local: only non-synced, non-discarded (synced ones come from remote)
    // Also deduplicate against remote IDs for the transition period
    const localItems: DisplayConsultation[] = useMemo(
        () =>
            Object.values(consultationsMap)
                .filter(
                    (c) =>
                        c.syncStatus !== "discarded" &&
                        c.syncStatus !== "synced" &&
                        !remoteIds.has(c.sessionId)
                )
                .map((c) => ({ ...c, source: "local" as const })),
        [consultationsMap, remoteIds]
    );

    // Remote: tag with source
    const remoteItems: DisplayConsultation[] = useMemo(
        () => remote.items.map((r) => ({ ...r, source: "remote" as const })),
        [remote.items]
    );

    // Example: tag with source
    const exampleItems: DisplayConsultation[] = useMemo(
        () => examples.items.map((e) => ({ ...e, source: "example" as const })),
        [examples.items]
    );

    // Merge and sort by timestamp desc
    const merged: DisplayConsultation[] = useMemo(
        () =>
            [...localItems, ...remoteItems, ...exampleItems].sort(
                (a, b) => getTimestamp(b) - getTimestamp(a)
            ),
        [localItems, remoteItems, exampleItems]
    );

    const groups = useMemo(() => groupByDate(merged), [merged]);

    const handleItemPress = useCallback(
        (consultation: DisplayConsultation) => {
            // ── Example consultation → navigate to example screen ──
            if (consultation.source === "example") {
                router.push("/history/example");
                return;
            }

            if (consultation.source === "remote" || consultation.syncStatus === "synced") {
                // TODO: Navigate to detail/transcription screen
                return;
            }

            // ── Interrupted recording (local, not finalized) ──
            if (consultation.source === "local" && !consultation.userFinalized) {
                router.push({
                    pathname: "/record/new-record",
                    params: { resumeSessionId: consultation.sessionId },
                });
                return;
            }

            // ── Finalized but not synced (local) → direct sync ──
            handleSync(consultation.sessionId);
        },
        [router]
    );

    const handleSync = async (sessionId: string) => {
        setSyncing(sessionId);
        try {
            const allDone = await retrySyncConsultation(sessionId);
            if (allDone) {
                await finalizeConsultation(sessionId);
                // Refresh remote list to show newly synced consultation
                await remote.refresh();
            } else {
                showToast("Falha ao sincronizar. Verifique sua conexão e tente novamente.");
            }
        } catch (err) {
            console.warn("[History] Sync failed:", err);
            showToast("Falha ao sincronizar. Verifique sua conexão e tente novamente.");
        } finally {
            setSyncing(null);
        }
    };

    const buildDescription = (c: DisplayConsultation): string => {
        const parts: string[] = [];
        if (c.durationMs > 0) parts.push(formatDuration(c.durationMs));
        if (c.guardianName) parts.push(c.guardianName);
        if (c.source === "local") {
            if (c.chunks.length > 0) parts.push(`${c.chunks.length} chunks`);
        } else if (c.source === "remote") {
            if (c.chunkCount > 0) parts.push(`${c.chunkCount} chunks`);
        }
        // source === "example": no chunks, just duration + guardian
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
                ListHeaderComponent={null}
                ListEmptyComponent={
                    remote.isLoading ? (
                        <View style={{ padding: 32, alignItems: "center" }}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    ) : (
                        <View style={{ padding: 32, alignItems: "center" }}>
                            <Text style={{ color: colors.textTertiary, fontSize: 14 }}>
                                Nenhuma consulta registrada
                            </Text>
                        </View>
                    )
                }
                ListFooterComponent={
                    remote.isLoadingMore ? (
                        <View style={{ paddingVertical: 16, alignItems: "center" }}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    ) : null
                }
                onEndReached={() => remote.loadMore()}
                onEndReachedThreshold={0.5}
                refreshing={remote.isLoading}
                onRefresh={() => remote.refresh()}
                renderItem={({ item: group }) => (
                    <View style={globalStyles.historyGroupCard}>
                        <View style={globalStyles.historyGroupTopStrip}>
                            <Text style={globalStyles.historyGroupTopStripText}>
                                {group.dateLabel}
                            </Text>
                        </View>

                        {group.items.map((consultation, idx) => {
                            const uploaded =
                                consultation.source === "local"
                                    ? consultation.chunks.filter((c) => c.status === "uploaded").length
                                    : undefined;
                            const totalChunks =
                                consultation.source === "local"
                                    ? consultation.chunks.length
                                    : undefined;

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
                                                    status={consultation.source === "example" ? "synced" : consultation.syncStatus}
                                                    uploadedChunks={uploaded}
                                                    totalChunks={totalChunks}
                                                    interrupted={
                                                        consultation.source === "local"
                                                            ? !consultation.userFinalized
                                                            : false
                                                    }
                                                    isExample={consultation.source === "example"}
                                                />
                                            </View>

                                            <Text style={globalStyles.historyItemTime}>
                                                {formatTime(getTimestamp(consultation))}
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
