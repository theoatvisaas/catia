import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { t } from "../../../i18n";
import { globalStyles } from "../../../styles/theme";

type RecordModeKey = "consultation" | "dictation";

type RecordMode = {
    key: RecordModeKey;
    title: string;
    description: string[];
    duration: string;
};

export default function RecordScreen() {
    const insets = useSafeAreaInsets();

    const modes: RecordMode[] = useMemo(
        () => [
            {
                key: "consultation",
                title: t("record", "modeConsultTitle"),
                description: [
                    t("record", "modeConsultLine1"),
                ],
                duration: t("record", "modeConsultDuration"),
            },
            {
                key: "dictation",
                title: t("record", "modeDictTitle"),
                description: [
                    t("record", "modeDictLine1"),
                    t("record", "modeDictLine2"),
                ],
                duration: t("record", "modeDictDuration"),
            },
        ],
        []
    );

    const handleSelectMode = (key: RecordModeKey) => {

        if (key === "consultation") router.push("/record/new-record") /* router.push("/(tabs)/record/new-record") */;
        if (key === "dictation") router.push("/dictation");
    };

    return (
        <View style={globalStyles.screenWithBottomBar}>
            <View
                style={[
                    globalStyles.topHeader,
                    { paddingTop: Math.max(insets.top, 10) },
                ]}
            >
                <Text style={globalStyles.topHeaderTitle}>{t("record", "title")}</Text>
            </View>

            <ScrollView
                style={globalStyles.recordScroll}
                contentContainerStyle={[
                    globalStyles.recordContent,
                    { paddingBottom: 78 + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {modes.map((mode) => (
                    <View key={mode.key} style={globalStyles.recordCard}>
                        <Text style={globalStyles.recordCardTitle}>{mode.title}</Text>

                        <Text style={globalStyles.recordCardText}>
                            {mode.description[0]}
                        </Text>

                        <Text style={[globalStyles.recordCardText, { marginTop: 30 }]}>
                            {mode.description[1]}
                        </Text>

                        <Text style={globalStyles.recordCardHint}>{mode.duration}</Text>

                        <Pressable
                            style={globalStyles.recordCTA}
                            onPress={() => handleSelectMode(mode.key)}
                        >
                            <Text style={globalStyles.recordCTAText}>
                                {t("record", "selectMode")}
                            </Text>
                        </Pressable>
                    </View>
                ))}
            </ScrollView>

        </View>
    );
}
