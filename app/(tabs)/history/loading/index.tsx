import { t } from "@/i18n";
import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";
import { router } from "expo-router";
import { CheckCircle2, ChevronLeft, Sparkles } from "lucide-react-native";
import React from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HistoryLoadingScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={globalStyles.screen}>
            <View style={[globalStyles.historyLoadingHeader, { paddingTop: Math.max(insets.top, 10) }]}>
                <Pressable onPress={() => router.back()} style={globalStyles.historyLoadingBack}>
                    <ChevronLeft size={22} color={colors.textSecondary} />
                </Pressable>

                <Text style={globalStyles.historyLoadingHeaderTitle}>
                    {t("historyLoading", "headerTitle")}
                </Text>

                <View style={globalStyles.historyLoadingHeaderRightSpace} />
            </View>

            <View style={globalStyles.historyLoadingContent}>
                <View style={globalStyles.historyLoadingMetaRow}>
                    <Text style={globalStyles.historyLoadingMetaDate}>
                        {t("historyLoading", "metaDate")}
                    </Text>
                </View>

                <Text style={globalStyles.historyLoadingPatientTitle}>
                    {t("historyLoading", "patientTitle")}
                </Text>

                <View style={globalStyles.historyLoadingActionsRow}>
                    <Pressable style={globalStyles.historyLoadingAdvancedButton}>

                        <Text style={globalStyles.historyLoadingAdvancedText}>
                            {t("historyLoading", "advancedActions")}
                        </Text>
                    </Pressable>

                    <TouchableOpacity style={globalStyles.historyLoadingMoreButton}>
                        <Text style={globalStyles.historyLoadingMoreText}>•••</Text>
                    </TouchableOpacity>
                </View>


                <View style={globalStyles.historyLoadingCard}>
                    <View style={globalStyles.historyLoadingIconWrap}>
                        <Sparkles size={28} color={colors.primary} />
                    </View>

                    <Text style={globalStyles.historyLoadingTitle}>
                        {t("historyLoading", "title")}
                    </Text>

                    <View style={globalStyles.historyLoadingProgressTrack}>
                        <View style={globalStyles.historyLoadingProgressFill} />
                    </View>

                    <View style={globalStyles.historyLoadingStepRow}>
                        <Text style={globalStyles.historyLoadingStepText}>
                            {t("historyLoading", "step")}
                        </Text>
                        <CheckCircle2 size={16} color={colors.success} />
                    </View>

                    <Text style={globalStyles.historyLoadingHint}>
                        {t("historyLoading", "hint")}
                    </Text>
                </View>

                <TouchableOpacity onPress={() => { }}>
                    <Text style={globalStyles.historyLoadingFooter}>
                        {t("historyLoading", "footer")}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
