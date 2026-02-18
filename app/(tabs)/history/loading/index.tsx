import AdvancedActionsModal from "@/components/app/history/AdvancedActionsModal";
import { ContextMenu } from "@/components/app/history/ContextMenu";
import { confirmDeleteTranscription } from "@/components/app/history/DelTranscription";
import EditPatientModal from "@/components/app/history/EditPacientModal";
import EditTranscription from "@/components/app/history/EditTranscription";
import PreparingReports from "@/components/app/history/PreparingReports";
import TranscriptionReady from "@/components/app/history/TranscriptionReady";
import { t } from "@/i18n";

import { useDocumentStore } from "@/stores/document/useDocumentStore";
import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";
import { ResDoc } from "@/types/documents";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Pencil, Trash2, Volume2, Wand } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    LayoutRectangle,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HistoryLoadingScreen() {
    const insets = useSafeAreaInsets();

    const params = useLocalSearchParams<{ id?: string }>();
    const documentId = useMemo(() => {
        const raw = params?.id;
        return Array.isArray(raw) ? raw[0] : raw;
    }, [params?.id]);

    const { documents, document, getDocuments, updateDocument, clearDocuments, loading } = useDocumentStore();


    const [preparing, setPreparing] = useState(false);
    const [open, setOpen] = useState(false);
    const [anchorRect, setAnchorRect] = useState<LayoutRectangle | null>(null);
    const [advancedActionsOpen, setAdvancedActionsOpen] = useState(false);
    const [editPatientOpen, setEditPatientOpen] = useState(false);
    const [editTranscriptionOpen, setEditTranscriptionOpen] = useState(false);
    const [titleDoc, setTitleDoc] = useState('')

    const consultation_id = 'ff6d6bab-29f4-439c-86e3-f1404d010c0b'

    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selectedDoc = useMemo(() => {
        if (!documents.length) return null;
        return documents.find((d) => d.id === selectedId) ?? documents[0];
    }, [documents, selectedId]);


    const fallbackText = useMemo(
        () => t("historyTranscription", "messageDefaultBody"),
        []
    );
    const [editableText, setEditableText] = useState(fallbackText);

    useEffect(() => {
        if (!consultation_id) return;

        getDocuments({ id: consultation_id }).catch(() => { });

        return () => {
            clearDocuments();
            setEditableText(fallbackText);
        };
    }, [consultation_id, getDocuments, clearDocuments, fallbackText]);


    useEffect(() => {
        if (!selectedDoc) return;

        setTitleDoc(selectedDoc.title ?? "");
        const serverText = selectedDoc.text ?? "";
        setEditableText(serverText.trim().length ? serverText : fallbackText);
    }, [selectedDoc, fallbackText]);

    const renderDocItem = ({ item }: { item: ResDoc }) => {
        const isActive = item.id === (selectedDoc?.id ?? null);

        return (
            <TouchableOpacity
                onPress={() => setSelectedId(item.id)}
                style={[
                    globalStyles.historyLoadingMoreButton,
                    {
                        marginBottom: 8,
                        opacity: isActive ? 1 : 0.7,
                    },
                ]}
            >
                <Text style={globalStyles.historyLoadingPatientTitle}>
                    {item.title}
                </Text>

                <Text style={globalStyles.historyLoadingMetaDate} numberOfLines={2}>
                    {item.text}
                </Text>
            </TouchableOpacity>
        );
    };



    return (
        <View style={globalStyles.loadingScreen}>
            <View
                style={[
                    globalStyles.historyLoadingHeader,
                    { paddingTop: Math.max(insets.top, 10) },
                ]}
            >
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
                                backgroundColor: preparing ? colors.surfaceSub : colors.primary,
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

                    <TouchableOpacity
                        onPress={() => setOpen(true)}
                        style={globalStyles.historyLoadingMoreButton}
                    >
                        <Text style={globalStyles.historyLoadingMoreText}>•••</Text>
                    </TouchableOpacity>
                </View>

                {preparing ? (
                    <PreparingReports />
                ) : loading && !document ? (
                    <View style={{ paddingVertical: 24, alignItems: "center" }}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <TranscriptionReady
                        messageText={editableText}
                        onEditSummary={() => {
                            setEditTranscriptionOpen(true);
                        }}
                    />
                )}

                {!preparing && (
                    <TouchableOpacity onPress={() => { }}>
                        <Text style={globalStyles.historyLoadingFooter}>
                            {t("historyLoading", "footer")}
                        </Text>
                    </TouchableOpacity>
                )}
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
                        onPress: () => router.push("/history/listen-record"),
                        icon: <Volume2 size={16} color={colors.textTertiary} />,
                    },
                    {
                        key: "delete",
                        label: "Excluir Transcrição",
                        onPress: () =>
                            confirmDeleteTranscription({
                                onConfirm: () => { },
                            }),
                        icon: <Trash2 size={16} color={colors.textTertiary} />,
                        danger: true,
                    },
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
                consultationId={consultation_id}
                visible={editPatientOpen}
                onClose={() => setEditPatientOpen(false)}
                onSave={(data) => {
                    console.log(data);
                    setEditPatientOpen(false);
                }}
            />

            <EditTranscription
                visible={editTranscriptionOpen}
                initialText={editableText}
                onClose={() => setEditTranscriptionOpen(false)}
                onSave={async (text) => {
                    const activeId = selectedDoc?.id;
                    if (!activeId) return;

                    const updated = await updateDocument({
                        id: activeId,
                        data: { text },
                    });


                    setEditableText(updated.text);
                    setEditTranscriptionOpen(false);
                }}
            />

        </View>
    );
}
