"use client";

import { t } from "@/i18n";
import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";
import { Copy, Pencil, Printer } from "lucide-react-native";
import React, { useMemo } from "react";
import { Share, Text, TouchableOpacity, View } from "react-native";

type Props = {
    summaryText?: string;
    messageText?: string;
    onEditSummary?: () => void;
};

export default function TranscriptionReady({
    summaryText,
    messageText,
    onEditSummary,
}: Props) {
    const summaryValue = useMemo(
        () => summaryText?.trim() || t("historyTranscription", "summaryEmpty"),
        [summaryText]
    );

    const messageValue = useMemo(
        () => messageText?.trim() || t("historyTranscription", "messageDefaultBody"),
        [messageText]
    );

    async function handleShare(text: string) {
        await Share.share({ message: text });
    }

    return (
        <View style={globalStyles.historyReadyWrap}>
            <View style={globalStyles.historyReadyCard}>
                <Text style={globalStyles.historyReadyCardTitle}>
                    {t("historyTranscription", "summaryTitle")}
                </Text>

                <Text
                    style={[
                        globalStyles.historyReadyCardBody,
                        !summaryText?.trim() ? globalStyles.historyReadyCardBodyMuted : null,
                    ]}
                >
                    {summaryValue}
                </Text>

                <View style={globalStyles.historyReadyActionsRow}>
                    <TouchableOpacity
                        onPress={onEditSummary}
                        style={globalStyles.historyReadyActionButton}
                        activeOpacity={0.85}
                    >
                        <Text style={globalStyles.historyReadyActionText}>
                            {t("historyTranscription", "edit")}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleShare(summaryValue)}
                        style={globalStyles.historyReadyActionButton}
                        activeOpacity={0.85}
                    >
                        <Text style={globalStyles.historyReadyActionText}>
                            {t("historyTranscription", "copy")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={globalStyles.historyReadyCard}>
                <Text style={globalStyles.historyReadyCardTitle}>
                    {t("historyTranscription", "messageTitle")}
                </Text>

                <Text style={globalStyles.historyReadyCardBody}>
                    {t("historyTranscription", "messageGreeting")}
                </Text>

                <Text style={globalStyles.historyReadyCardBody}>
                    {messageValue}
                </Text>

                <View style={globalStyles.historyReadyActionsWrap}>
                    <TouchableOpacity
                        onPress={onEditSummary}
                        style={globalStyles.historyReadyActionButton}
                        activeOpacity={0.85}
                    >
                        <View style={globalStyles.historyReadyActionContent}>
                            <Pencil size={16} color={colors.textSecondary} />
                            <Text style={globalStyles.historyReadyActionText}>
                                {t("historyTranscription", "editEnd")}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleShare(messageValue)}
                        style={globalStyles.historyReadyActionButton}
                        activeOpacity={0.85}
                    >
                        <View style={globalStyles.historyReadyActionContent}>
                            <Copy size={16} color={colors.textSecondary} />
                            <Text style={globalStyles.historyReadyActionText}>
                                {t("historyTranscription", "copy")}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleShare(messageValue)}
                        style={globalStyles.historyReadyActionButton}
                        activeOpacity={0.85}
                    >
                        <View style={globalStyles.historyReadyActionContent}>
                            <Printer size={16} color={colors.textSecondary} />
                            <Text style={globalStyles.historyReadyActionText}>
                                {t("historyTranscription", "print")}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>


            </View>
        </View>
    );
}
