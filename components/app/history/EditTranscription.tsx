// components/app/history/EditTranscription.tsx
"use client";

import { t } from "@/i18n";
import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";
import React, { useEffect, useMemo, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

type Props = {
    visible: boolean;
    onClose: () => void;

    initialText?: string;

    onSave?: (text: string) => void;
};

type ToolbarKey = "bold" | "h" | "list" | "list2";

export default function EditTranscription({
    visible,
    onClose,
    initialText = "",
    onSave,
}: Props) {
    const [value, setValue] = useState(initialText);
    const [active, setActive] = useState<Set<ToolbarKey>>(new Set());

    useEffect(() => {
        if (visible) setValue(initialText);
    }, [visible, initialText]);

    const canSave = useMemo(() => value.trim().length > 0, [value]);

    function toggle(key: ToolbarKey) {
        setActive((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    }

    function handleSave() {
        onSave?.(value);
        onClose();
    }

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
            <View style={globalStyles.editTranscriptionBackdrop}>
                {/* backdrop NÃO fecha (réplica do comportamento que você vem pedindo) */}
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
                            <Pressable
                                onPress={() => toggle("bold")}
                                style={({ pressed }) => [
                                    globalStyles.editTranscriptionToolBtn,
                                    active.has("bold") ? globalStyles.editTranscriptionToolBtnActive : null,
                                    pressed ? globalStyles.editTranscriptionToolBtnPressed : null,
                                ]}
                            >
                                <Text
                                    style={[
                                        globalStyles.editTranscriptionToolText,
                                        active.has("bold") ? globalStyles.editTranscriptionToolTextActive : null,
                                    ]}
                                >
                                    B
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => toggle("h")}
                                style={({ pressed }) => [
                                    globalStyles.editTranscriptionToolBtn,
                                    active.has("h") ? globalStyles.editTranscriptionToolBtnActive : null,
                                    pressed ? globalStyles.editTranscriptionToolBtnPressed : null,
                                ]}
                            >
                                <Text
                                    style={[
                                        globalStyles.editTranscriptionToolText,
                                        active.has("h") ? globalStyles.editTranscriptionToolTextActive : null,
                                    ]}
                                >
                                    H
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => toggle("list")}
                                style={({ pressed }) => [
                                    globalStyles.editTranscriptionToolBtn,
                                    active.has("list") ? globalStyles.editTranscriptionToolBtnActive : null,
                                    pressed ? globalStyles.editTranscriptionToolBtnPressed : null,
                                ]}
                            >
                                <Text
                                    style={[
                                        globalStyles.editTranscriptionToolText,
                                        active.has("list") ? globalStyles.editTranscriptionToolTextActive : null,
                                    ]}
                                >
                                    ≡
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => toggle("list2")}
                                style={({ pressed }) => [
                                    globalStyles.editTranscriptionToolBtn,
                                    active.has("list2") ? globalStyles.editTranscriptionToolBtnActive : null,
                                    pressed ? globalStyles.editTranscriptionToolBtnPressed : null,
                                ]}
                            >
                                <Text
                                    style={[
                                        globalStyles.editTranscriptionToolText,
                                        active.has("list2") ? globalStyles.editTranscriptionToolTextActive : null,
                                    ]}
                                >
                                    ≡≡
                                </Text>
                            </Pressable>
                        </View>

                        <View style={globalStyles.editTranscriptionEditorDivider} />

                        <ScrollView
                            style={globalStyles.editTranscriptionEditorScroll}
                            contentContainerStyle={globalStyles.editTranscriptionEditorContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <TextInput
                                style={globalStyles.editTranscriptionInput}
                                value={value}
                                onChangeText={setValue}
                                placeholder={t("historyTranscription", "editPlaceholder")}
                                placeholderTextColor={colors.textDisabled}
                                multiline
                                textAlignVertical="top"
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
