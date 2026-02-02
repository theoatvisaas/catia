"use client";

import { t } from "@/i18n";
import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";

type Props = {
    visible: boolean;
    onClose: () => void;

    initialText?: string;

    onSave?: (text: string) => void;
};

export default function EditTranscription({
    visible,
    onClose,
    initialText = "",
    onSave,
}: Props) {
    const editorRef = useRef<RichEditor>(null);

    const [value, setValue] = useState(initialText);

    useEffect(() => {
        if (!visible) return;
        setValue(initialText);
        requestAnimationFrame(() => {
            editorRef.current?.setContentHTML(initialText || "");
        });
    }, [visible, initialText]);

    const canSave = useMemo(() => value.trim().length > 0, [value]);

    async function handleSave() {
        const html = await editorRef.current?.getContentHtml();
        const next = (html ?? "").trim();
        onSave?.(next);
        onClose();
    }

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
            <View style={globalStyles.editTranscriptionBackdrop}>
                <Pressable style={globalStyles.editTranscriptionBackdropPressable} />

                <View style={globalStyles.editTranscriptionSheet}>
                    <View style={globalStyles.editTranscriptionHeader}>
                        <Text style={globalStyles.editTranscriptionTitle}>
                            {t("historyTranscription", "editTitle")}
                        </Text>

                        <Pressable
                            onPress={onClose}
                            style={({ pressed }) => [
                                globalStyles.editTranscriptionCloseBtn,
                                pressed ? globalStyles.editTranscriptionCloseBtnPressed : null,
                            ]}
                            hitSlop={10}
                        >
                            <Text style={globalStyles.editTranscriptionCloseIcon}>×</Text>
                        </Pressable>
                    </View>

                    <View style={globalStyles.editTranscriptionDivider} />

                    <View style={globalStyles.editTranscriptionEditorCard}>
                        <View style={globalStyles.editTranscriptionToolbar}>
                            <RichToolbar
                                editor={editorRef}
                                actions={[
                                    actions.setBold,
                                    actions.heading1,
                                    actions.setParagraph,
                                    actions.insertBulletsList,
                                    actions.insertOrderedList,
                                ]}

                                iconMap={{
                                    [actions.setBold]: ({ tintColor }: any) => (
                                        <Text style={[globalStyles.editTranscriptionToolText, { color: tintColor }]}>
                                            B
                                        </Text>
                                    ),
                                    [actions.heading1]: ({ tintColor }: any) => (
                                        <Text style={[globalStyles.editTranscriptionToolText, { color: tintColor }]}>
                                            H
                                        </Text>
                                    ),
                                    [actions.setParagraph]: ({ tintColor }: any) => (
                                        <Text style={[globalStyles.editTranscriptionToolText, { color: tintColor }]}>
                                            P
                                        </Text>
                                    ),
                                    [actions.insertBulletsList]: ({ tintColor }: any) => (
                                        <Text style={[globalStyles.editTranscriptionToolText, { color: tintColor }]}>
                                            ≡
                                        </Text>
                                    ),
                                    [actions.insertOrderedList]: ({ tintColor }: any) => (
                                        <Text style={[globalStyles.editTranscriptionToolText, { color: tintColor }]}>
                                            ≡≡
                                        </Text>
                                    ),
                                }}
                                style={{ backgroundColor: "transparent" }}
                            />
                        </View>

                        <View style={globalStyles.editTranscriptionEditorDivider} />

                        <ScrollView
                            style={globalStyles.editTranscriptionEditorScroll}
                            contentContainerStyle={globalStyles.editTranscriptionEditorContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <RichEditor
                                ref={editorRef}
                                initialContentHTML={initialText || ""}
                                style={globalStyles.editTranscriptionInput}
                                placeholder={t("historyTranscription", "editPlaceholder")}
                                initialHeight={180}
                                editorStyle={{
                                    backgroundColor: "transparent",
                                    color: colors.textPrimary,
                                    placeholderColor: colors.textDisabled,
                                    contentCSSText: "font-size: 16px;",
                                }}
                                onChange={(html) => setValue(html)}
                            />
                        </ScrollView>
                    </View>

                    <View style={globalStyles.editTranscriptionFooter}>
                        <Pressable
                            onPress={handleSave}
                            disabled={!canSave}
                            style={({ pressed }) => [
                                globalStyles.editTranscriptionSaveButton,
                                !canSave ? globalStyles.editTranscriptionSaveButtonDisabled : null,
                                pressed ? globalStyles.editTranscriptionSaveButtonPressed : null,
                            ]}
                        >
                            <Text style={globalStyles.editTranscriptionSaveText}>
                                {t("historyTranscription", "save")}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
