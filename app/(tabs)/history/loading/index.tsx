import AdvancedActionsModal from "@/components/app/history/AdvancedActionsModal";
import { ContextMenu } from "@/components/app/history/ContextMenu";
import { confirmDeleteTranscription } from "@/components/app/history/DelTranscription";
import EditPatientModal from "@/components/app/history/EditPacientModal";
import PreparingReports from "@/components/app/history/PreparingReports";
import TranscriptionReady from "@/components/app/history/TranscriptionReady";
import { t } from "@/i18n";

import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";
import { router } from "expo-router";
import { ChevronLeft, Pencil, Trash2, Volume2, Wand } from "lucide-react-native";
import React, { useState } from "react";
import {
    LayoutRectangle,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HistoryLoadingScreen() {
    const insets = useSafeAreaInsets();
    const [preparing, setPreparing] = useState(false);
    const [open, setOpen] = useState(false);
    const [anchorRect, setAnchorRect] = useState<LayoutRectangle | null>(null);
    const [advancedActionsOpen, setAdvancedActionsOpen] = useState(false);
    const [editPatientOpen, setEditPatientOpen] = useState(false);


    return (
        <View style={globalStyles.loadingScreen}>
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
                style={globalStyles.historyLoadingContent}
                contentContainerStyle={{ paddingBottom: 16 + insets.bottom }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={globalStyles.historyLoadingMetaRow}>
                    <Text style={globalStyles.historyLoadingMetaDate}>
                        {t("historyLoading", "metaDate")}
                    </Text>
                </View>

                <Text style={globalStyles.historyLoadingPatientTitle}>
                    {t("historyLoading", "patientTitle")}
                </Text>

                <View style={globalStyles.historyLoadingActionsRow}>
                    <TouchableOpacity
                        onPress={() => setAdvancedActionsOpen(true)}
                        style={[
                            globalStyles.historyLoadingAdvancedButton,
                            {
                                backgroundColor: preparing
                                    ? colors.surfaceSub
                                    : colors.primary,
                            },
                        ]}
                    >
                        <Wand
                            size={16}
                            color={colors.primaryWhite}
                            style={{ marginRight: 6 }}
                        />

                        <Text style={globalStyles.historyLoadingAdvancedText}>
                            {t("historyLoading", "advancedActions")}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setOpen(true)} style={globalStyles.historyLoadingMoreButton}>
                        <Text style={globalStyles.historyLoadingMoreText}>•••</Text>
                    </TouchableOpacity>
                </View>

                {preparing ? (
                    <PreparingReports />
                ) : (
                    <TranscriptionReady />
                )}


                <TouchableOpacity onPress={() => { }}>
                    <Text style={globalStyles.historyLoadingFooter}>
                        {t("historyLoading", "footer")}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            <ContextMenu
                visible={open}
                onClose={() => setOpen(false)}
                anchorRect={anchorRect}
                items={[
                    {
                        key: "edit",
                        label: "Editar",
                        onPress: () => setEditPatientOpen(true),
                        icon: <Pencil size={16} color={colors.textTertiary} />,
                    },
                    {
                        key: "listen",
                        label: "Ouvir Gravação",
                        onPress: () => console.log("Ouvir"),
                        icon: <Volume2 size={16} color={colors.textTertiary} />,
                    },
                    {
                        key: "delete",
                        label: "Excluir Transcrição",
                        onPress: () =>
                            confirmDeleteTranscription({
                                onConfirm: () => {
                                },
                            }),
                        icon: <Trash2 size={16} color={colors.textTertiary} />,
                        danger: true,
                    }
                ]}
            />

            <AdvancedActionsModal
                visible={advancedActionsOpen}
                onClose={() => setAdvancedActionsOpen(false)}
                onSelect={(action) => {
                    setAdvancedActionsOpen(false);
                }}
            />

            <EditPatientModal
                visible={editPatientOpen}
                onClose={() => setEditPatientOpen(false)}
                onSave={(data) => {
                    console.log(data);
                    setEditPatientOpen(false);
                }}
            />

        </View>
    );
}
