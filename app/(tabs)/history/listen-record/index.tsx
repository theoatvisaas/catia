// app/(tabs)/Transcription.tsx
import { t } from "@/i18n";
import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";
import { router } from "expo-router";
import { ChevronLeft, Pause, Play } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Transcription() {
    const insets = useSafeAreaInsets();
    const [playingTop, setPlayingTop] = useState(false);
    const [playingBottom, setPlayingBottom] = useState(false);

    return (
        <View style={globalStyles.transcriptionScreen}>

            <View
                style={[globalStyles.historyLoadingHeader, { paddingTop: Math.max(insets.top, 10) }]}>
                <Pressable
                    onPress={() => router.back()}
                    style={globalStyles.historyLoadingBack}
                >
                    <ChevronLeft size={22} color={colors.textSecondary} />
                </Pressable>

                <Text style={globalStyles.historyLoadingHeaderTitle}>
                    {t("historyLoading", "headerTitle")}
                </Text>

                <View style={globalStyles.historyLoadingHeaderRightSpace} />
            </View>

            <ScrollView
                style={globalStyles.transcriptionScroll}
                contentContainerStyle={{ paddingBottom: 16 + insets.bottom }}
                showsVerticalScrollIndicator={false}
            >
                <View style={globalStyles.transcriptionCard}>
                    <Text style={globalStyles.transcriptionMetaLabel}>
                        {t("transcription", "modeLabel")}
                    </Text>
                    <Text style={globalStyles.transcriptionMetaTitle}>
                        {t("transcription", "modeValue")}
                    </Text>

                    <View style={globalStyles.transcriptionDivider} />

                    <View style={globalStyles.transcriptionRow}>
                        <Text style={globalStyles.transcriptionLabel}>{t("transcription", "createdByLabel")}</Text>
                        <Text style={globalStyles.transcriptionValueStrong}>{t("transcription", "createdByValue")}</Text>
                    </View>

                    <View style={globalStyles.transcriptionRow}>
                        <Text style={globalStyles.transcriptionLabel}>{t("transcription", "createdAtLabel")}</Text>
                        <Text style={globalStyles.transcriptionValueStrong}>{t("transcription", "createdAtValue")}</Text>
                    </View>

                    <View style={globalStyles.transcriptionRow}>
                        <Text style={globalStyles.transcriptionLabel}>{t("transcription", "startedAtLabel")}</Text>
                        <Text style={globalStyles.transcriptionValueStrong}>{t("transcription", "startedAtValue")}</Text>
                    </View>

                    <View style={globalStyles.transcriptionRow}>
                        <Text style={globalStyles.transcriptionLabel}>{t("transcription", "finishedAtLabel")}</Text>
                        <Text style={globalStyles.transcriptionValueStrong}>{t("transcription", "finishedAtValue")}</Text>
                    </View>

                    <View style={globalStyles.transcriptionRowLast}>
                        <Text style={globalStyles.transcriptionLabel}>{t("transcription", "durationLabel")}</Text>
                        <Text style={globalStyles.transcriptionValueStrong}>{t("transcription", "durationValue")}</Text>
                    </View>
                </View>

                <View style={globalStyles.transcriptionCard}>
                    <Text style={globalStyles.transcriptionSectionTitle}>
                        {t("transcription", "listenTitle")}
                    </Text>

                    <Text style={globalStyles.transcriptionListenText}>
                        {t("transcription", "listenBody")}
                    </Text>

                    <View style={globalStyles.transcriptionPlayerBlock}>
                        <Text style={globalStyles.transcriptionPlayerTime}>
                            {t("transcription", "playerTime")}
                        </Text>

                        <View style={globalStyles.transcriptionPlayerRow}>
                            <Pressable
                                onPress={() => setPlayingTop((v) => !v)}
                                style={({ pressed }) => [
                                    globalStyles.transcriptionPlayerButton,
                                    pressed && globalStyles.transcriptionPlayerButtonPressed,
                                ]}
                            >
                                {playingTop ? (
                                    <Pause size={18} color={colors.primaryWhite} />
                                ) : (
                                    <Play size={18} color={colors.primaryWhite} />
                                )}
                            </Pressable>

                            <View style={globalStyles.transcriptionSliderTrack}>
                                <View style={[globalStyles.transcriptionSliderFill, { width: "72%" }]} />
                                <View style={[globalStyles.transcriptionSliderThumb, { left: "72%" }]} />
                            </View>
                        </View>
                    </View>

                    <View style={globalStyles.transcriptionPlayerBlock}>
                        <Text style={globalStyles.transcriptionPlayerTime}>
                            {t("transcription", "playerTime")}
                        </Text>

                        <View style={globalStyles.transcriptionPlayerRow}>
                            <Pressable
                                onPress={() => setPlayingBottom((v) => !v)}
                                style={({ pressed }) => [
                                    globalStyles.transcriptionPlayerButton,
                                    pressed && globalStyles.transcriptionPlayerButtonPressed,
                                ]}
                            >
                                {playingBottom ? (
                                    <Pause size={18} color={colors.primaryWhite} />
                                ) : (
                                    <Play size={18} color={colors.primaryWhite} />
                                )}
                            </Pressable>

                            <View style={globalStyles.transcriptionSliderTrack}>
                                <View style={[globalStyles.transcriptionSliderFill, { width: "6%" }]} />
                                <View style={[globalStyles.transcriptionSliderThumb, { left: "6%" }]} />
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
