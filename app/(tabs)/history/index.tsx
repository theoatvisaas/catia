// app/(tabs)/History.tsx
import { t } from "@/i18n";
import { globalStyles } from "@/styles/theme";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HistoryItem = {
    id: string;
    name: string;
    badge?: string;
    time: string;
    description: string;
};

type HistoryGroup = {
    id: string;
    dateLabel: string;
    items: HistoryItem[];
};

export default function History() {
    const insets = useSafeAreaInsets();

    const groups: HistoryGroup[] = useMemo(
        () => [
            {
                id: "2025-11-10",
                dateLabel: t("history", "dateNov10_2025"),
                items: [
                    {
                        id: "unidentified-2302",
                        name: t("history", "unidentifiedTitle"),
                        time: t("history", "time_2302"),
                        description: t("history", "unidentifiedSubtitle"),
                    },
                    {
                        id: "biscoto-2138",
                        name: t("history", "biscotoTitle"),
                        badge: t("history", "badgeExample"),
                        time: t("history", "time_2138"),
                        description: t("history", "biscotoSubtitle"),
                    },
                    {
                        id: "luna-2138",
                        name: t("history", "lunaTitle"),
                        badge: t("history", "badgeExample"),
                        time: t("history", "time_2138"),
                        description: t("history", "lunaSubtitle"),
                    },
                    {
                        id: "max-2138",
                        name: t("history", "maxTitle"),
                        badge: t("history", "badgeExample"),
                        time: t("history", "time_2138"),
                        description: t("history", "maxSubtitle"),
                    },
                ],
            },
        ],
        []
    );

    return (
        <View style={globalStyles.historyScreen}>
            <View style={[globalStyles.historyHeader, { paddingTop: Math.max(insets.top, 10) }]}>
                <Text style={globalStyles.historyHeaderTitle}>{t("history", "headerTitle")}</Text>
            </View>

            <FlatList
                data={groups}
                keyExtractor={(g) => g.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={globalStyles.historyContent}
                style={globalStyles.historyScroll}
                renderItem={({ item: group }) => {
                    return (
                        <View style={globalStyles.historyGroupCard}>
                            <View style={globalStyles.historyGroupTopStrip}>
                                <Text style={globalStyles.historyGroupTopStripText}>{group.dateLabel}</Text>
                            </View>

                            {group.items.map((it, idx) => {

                                const targetRoute =
                                    it.id === "unidentified-2302"
                                        ? "/history/loading"
                                        : "/history/example";

                                return (
                                    <View key={it.id}>
                                        <Pressable
                                            onPress={() => router.push(targetRoute)}
                                            style={({ pressed }) => [
                                                globalStyles.historyItem,
                                                pressed && globalStyles.historyItemPressed,
                                            ]}
                                        >
                                            <View style={globalStyles.historyItemTopRow}>
                                                <View style={globalStyles.historyItemLeftTop}>
                                                    <Text style={globalStyles.historyItemTitle}>{it.name}</Text>

                                                    {!!it.badge && (
                                                        <View style={globalStyles.historyBadge}>
                                                            <Text style={globalStyles.historyBadgeText}>{it.badge}</Text>
                                                        </View>
                                                    )}
                                                </View>

                                                <Text style={globalStyles.historyItemTime}>{it.time}</Text>
                                            </View>

                                            <Text style={globalStyles.historyItemSubtitle}>{it.description}</Text>
                                        </Pressable>

                                        {idx < group.items.length - 1 && <View style={globalStyles.historyDivider} />}
                                    </View>
                                )
                            })}
                        </View>
                    );
                }}
            />
        </View>
    );
}
