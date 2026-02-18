"use client";

import { t } from "@/i18n";
import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";
import { renderWhatsText } from "@/utils/renderWhatsText";
import * as Clipboard from "expo-clipboard";
import * as Print from "expo-print";
import { Copy, Pencil, Printer } from "lucide-react-native";
import React, { useMemo } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";



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

    async function handleCopy(text: string) {
        await Clipboard.setStringAsync(text);
        Alert.alert(
            t("historyTranscription", "copySuccessTitle"),
            t("historyTranscription", "copySuccessSubtitle"),
            [{ text: "OK" }]
        );
    }

    async function handlePrint(text: string) {
        const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: -apple-system, system-ui, Arial; padding: 24px; }
          h1 { font-size: 20px; margin: 0 0 16px 0; }
          p { font-size: 14px; line-height: 1.5; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>${t("historyTranscription", "printTitle")}</h1>
        <p>${escapeHtml(text)}</p>
      </body>
    </html>
                    `;

        await Print.printAsync({ html });
    }

    function escapeHtml(input: string) {
        return input
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
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
                        onPress={() => handleCopy(messageValue)}
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

                {renderWhatsText(messageValue, {
                    body: globalStyles.historyReadyCardBody,
                    title: [
                        globalStyles.historyReadyCardBody,
                        { fontSize: 16, fontWeight: "800", marginTop: 8, marginBottom: 6 },
                    ],
                    bold: { fontWeight: "800" },
                    italic: { fontStyle: "italic" },
                    strike: { textDecorationLine: "line-through" },
                })}


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
                        onPress={() => handleCopy(messageValue)}
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
                        onPress={() => handlePrint(messageValue)}
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
