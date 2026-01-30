// app/history/example.tsx (ou onde você estiver criando essa tela "example")
"use client";

import { t } from "@/i18n";
import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";
import { router } from "expo-router";
import {
    ChevronLeft,
    Pause,
    Play,
    Sparkles
} from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ExampleScreen() {
    const insets = useSafeAreaInsets();
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <View style={globalStyles.exampleScreen}>
            {/* Header */}
            <View
                style={[
                    globalStyles.exampleHeader,
                    { paddingTop: Math.max(insets.top, 10) },
                ]}
            >
                <Pressable
                    onPress={() => router.back()}
                    style={globalStyles.exampleHeaderBack}
                    hitSlop={10}
                >
                    <ChevronLeft size={22} color={colors.textSecondary} />
                </Pressable>

                <Text style={globalStyles.exampleHeaderTitle}>
                    {t("historyExample", "headerTitle")}
                </Text>

                <View style={globalStyles.exampleHeaderRightSpace} />
            </View>

            <ScrollView
                style={globalStyles.exampleScroll}
                contentContainerStyle={[
                    globalStyles.exampleContent,
                    { paddingBottom: 18 + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Patient + badge */}
                <View style={globalStyles.examplePatientRow}>
                    <Text style={globalStyles.examplePatientName}>
                        {t("historyExample", "patientName")}
                    </Text>

                    <View style={globalStyles.examplePatientBadge}>
                        <Text style={globalStyles.examplePatientBadgeText}>
                            {t("historyExample", "patientBadge")}
                        </Text>
                    </View>
                </View>

                {/* Audio card */}
                <Pressable
                    onPress={() => { }}
                    style={({ pressed }) => [
                        globalStyles.exampleAudioCard,
                        pressed ? globalStyles.exampleAudioCardPressed : null,
                    ]}
                >
                    <View style={globalStyles.exampleAudioLeft}>
                        <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)} style={globalStyles.exampleAudioPlayCircle}>
                            {isPlaying ? (
                                <Pause size={18} color={colors.primary} />
                            ) : (
                                <Play size={18} color={colors.primary} />
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={globalStyles.exampleAudioBody}>
                        <Text style={globalStyles.exampleAudioTitle}>
                            {t("historyExample", "listenOriginalTitle")}
                        </Text>
                        <Text style={globalStyles.exampleAudioSubtitle}>
                            {t("historyExample", "listenOriginalDuration")}
                        </Text>

                        <View style={globalStyles.exampleAudioDotRow}>
                            <View style={globalStyles.exampleAudioDot} />
                        </View>
                    </View>
                </Pressable>

                {/* Intro */}
                <Text style={globalStyles.exampleIntroText}>
                    {t("historyExample", "intro")}
                </Text>

                {/* Items */}
                <View style={globalStyles.exampleList}>
                    <View style={globalStyles.exampleListRow}>
                        <Sparkles size={16} color={colors.warning} />
                        <Text style={globalStyles.exampleListText}>
                            {t("historyExample", "item1")}
                        </Text>
                    </View>

                    <View style={globalStyles.exampleListRow}>
                        <Sparkles size={16} color={colors.warning} />
                        <Text style={globalStyles.exampleListText}>
                            {t("historyExample", "item2")}
                        </Text>
                    </View>

                    <View style={globalStyles.exampleListRow}>
                        <Sparkles size={16} color={colors.warning} />
                        <Text style={globalStyles.exampleListText}>
                            {t("historyExample", "item3")}
                        </Text>
                    </View>

                    <View style={globalStyles.exampleListRow}>
                        <Sparkles size={16} color={colors.warning} />
                        <Text style={globalStyles.exampleListText}>
                            {t("historyExample", "item4")}
                        </Text>
                    </View>
                </View>

                {/* Section */}
                {/* Section */}
                <View style={globalStyles.exampleSectionCard}>
                    <View style={globalStyles.exampleSectionHeaderRow}>
                        <Text style={globalStyles.exampleSectionTitle}>
                            {t("historyExample", "sectionTitle")}
                        </Text>
                    </View>

                    {/* Badge flutuante (fora do fluxo) */}
                    <View style={globalStyles.exampleSectionBadgeWrap}>
                        <View style={globalStyles.exampleSectionBadge}>
                            <Text style={globalStyles.exampleSectionBadgeText}>
                                {t("historyExample", "sectionBadge")}
                            </Text>
                        </View>

                        <View style={globalStyles.exampleSectionBadgeSpark1} />
                        <View style={globalStyles.exampleSectionBadgeSpark2} />
                        <View style={globalStyles.exampleSectionBadgeSpark3} />
                    </View>

                    <Text style={globalStyles.exampleSectionBody}>
                        {t("historyExample", "sectionBody")}
                    </Text>
                </View>

            </ScrollView>
        </View>
    );
}
