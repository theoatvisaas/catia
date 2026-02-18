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
    initialText?: string; // <- AGORA: texto no formato WhatsApp markup (* _ ~ ```)
    onSave?: (text: string) => void; // <- AGORA: salva WhatsApp markup
};

/**
 * Converte WhatsApp markup -> HTML (pra exibir visual no editor)
 * Suporta: *bold*, _italic_, ~strike~, ```mono```
 */
function whatsappToHtml(input: string) {
    const escape = (s: string) =>
        s
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    // preserva quebras
    let s = escape(input).replace(/\r\n/g, "\n");

    // code primeiro (pode conter asteriscos etc.)
    s = s.replace(/```([\s\S]*?)```/g, (_m, g1) => `<code>${g1}</code>`);

    // bold / italic / strike (não atravessa linha pra evitar bagunça)
    s = s.replace(/\*([^\n*]+)\*/g, (_m, g1) => `<strong>${g1}</strong>`);
    s = s.replace(/_([^\n_]+)_/g, (_m, g1) => `<em>${g1}</em>`);
    s = s.replace(/~([^\n~]+)~/g, (_m, g1) => `<del>${g1}</del>`);

    // Quebras de linha -> <br/>
    s = s.replace(/\n/g, "<br/>");

    // embrulha num container simples
    return `<div>${s}</div>`;
}

/**
 * Converte HTML do editor -> WhatsApp markup (pra salvar / mandar pro Whats)
 * Mapeia: <strong>/<b> => *...*, <em>/<i> => _..._, <del>/<s>/<strike> => ~...~, <code> => ```...```
 */
function htmlToWhatsapp(html: string) {
    let s = html || "";

    s = s
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
        .replace(/<\/div>\s*<div[^>]*>/gi, "\n");

    // code primeiro
    s = s.replace(
        /<code[^>]*>([\s\S]*?)<\/code>/gi,
        (_m, g1) => `\`\`\`${stripTags(g1)}\`\`\``
    );

    s = s.replace(
        /<span[^>]*style="[^"]*text-decoration\s*:\s*line-through[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
        (_m, g1) => `<del>${g1}</del>`
    );

    s = s.replace(
        /<span[^>]*style='[^']*text-decoration\s*:\s*line-through[^']*'[^>]*>([\s\S]*?)<\/span>/gi,
        (_m, g1) => `<del>${g1}</del>`
    );

    s = s.replace(
        /<span[^>]*style="[^"]*(text-decoration-line|text-decoration)\s*:\s*line-through[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
        (_m, _prop, g1) => `<del>${g1}</del>`
    );

    s = s.replace(
        /<span[^>]*style='[^']*(text-decoration-line|text-decoration)\s*:\s*line-through[^']*'[^>]*>([\s\S]*?)<\/span>/gi,
        (_m, _prop, g1) => `<del>${g1}</del>`
    );


    // 1) bold+italic aninhado PRIMEIRO (senão o <strong> come o <em>)
    s = s.replace(
        /<(strong|b)[^>]*>\s*<(em|i)[^>]*>([\s\S]*?)<\/\2>\s*<\/\1>/gi,
        (_m, _b, _i, g1) => `*_${(g1)}_*`
    );

    s = s.replace(
        /<(em|i)[^>]*>\s*<(strong|b)[^>]*>([\s\S]*?)<\/\2>\s*<\/\1>/gi,
        (_m, _i, _b, g1) => `*_${(g1)}_*`
    );

    // 2) strong/bold
    s = s.replace(
        /<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi,
        (_m, _tag, g1) => `*${stripTags(g1)}*`
    );

    // 3) italic
    s = s.replace(
        /<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi,
        (_m, _tag, g1) => `_${stripTags(g1)}_`
    );

    // 4) strike
    s = s.replace(
        /<(del|s|strike)[^>]*>([\s\S]*?)<\/\1>/gi,
        (_m, _tag, g1) => `~${stripTags(g1)}~`
    );

    s = stripTags(s);

    s = s
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");

    s = s.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").trim();

    return s;
}


function stripTags(input: string) {
    return (input || "").replace(/<[^>]+>/g, "");
}

function applyInlineMarkersInHtml(html: string) {
    let s = html || "";

    s = s.replace(/```([\s\S]*?)```/g, (_m, g1) => `<code>${g1}</code>`);

    s = s.replace(/\*([^\n*]+)\*/g, (_m, g1) => `<strong>${g1}</strong>`);
    s = s.replace(/_([^\n_]+)_/g, (_m, g1) => `<em>${g1}</em>`);
    s = s.replace(/~([^\n~]+)~/g, (_m, g1) => `<del>${g1}</del>`);

    return s;
}

export default function EditTranscription({
    visible,
    onClose,
    initialText = "",
    onSave,
}: Props) {
    const editorRef = useRef<RichEditor>(null);

    // Guarda HTML (porque é o que o editor usa)
    const [htmlValue, setHtmlValue] = useState<string>(whatsappToHtml(initialText));

    // trava pra não entrar em loop ao chamar setContentHTML dentro do onChange
    const isApplyingRef = useRef(false);

    useEffect(() => {
        if (!visible) return;

        const initialHtml = whatsappToHtml(initialText || "");
        setHtmlValue(initialHtml);

        requestAnimationFrame(() => {
            editorRef.current?.setContentHTML(initialHtml);
        });
    }, [visible, initialText]);

    const canSave = useMemo(() => stripTags(htmlValue).trim().length > 0, [htmlValue]);

    async function handleSave() {
        const html = await editorRef.current?.getContentHtml();

        const whatsapp = htmlToWhatsapp((html ?? "").trim());

        onSave?.(whatsapp);
        onClose();
    }



    function handleChange(nextHtml: string) {
        if (isApplyingRef.current) {
            setHtmlValue(nextHtml);
            return;
        }

        const normalized = applyInlineMarkersInHtml(nextHtml);

        if (normalized !== nextHtml) {
            isApplyingRef.current = true;
            setHtmlValue(normalized);

            requestAnimationFrame(() => {
                editorRef.current?.setContentHTML(normalized);

                requestAnimationFrame(() => {
                    isApplyingRef.current = false;
                });
            });

            return;
        }

        setHtmlValue(nextHtml);
    }

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
            <View style={globalStyles.editTranscriptionBackdrop}>
                <Pressable style={globalStyles.editTranscriptionBackdropPressable} onPress={onClose} />

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
                                    actions.setItalic,
                                    actions.setStrikethrough,
                                ]}
                                iconMap={{
                                    [actions.setBold]: ({ tintColor }: any) => (
                                        <Text style={[globalStyles.editTranscriptionToolText, { color: tintColor }]}>B</Text>
                                    ),
                                    [actions.setItalic]: ({ tintColor }: any) => (
                                        <Text style={[globalStyles.editTranscriptionToolText, { color: tintColor }]}>I</Text>
                                    ),
                                    [actions.setStrikethrough]: ({ tintColor }: any) => (
                                        <Text style={[globalStyles.editTranscriptionToolText, { color: tintColor }]}>S</Text>
                                    ),
                                }}
                                style={{ backgroundColor: "transparent" }}
                            />
                        </View>

                        <View style={globalStyles.editTranscriptionEditorDivider} />

                        <ScrollView
                            style={globalStyles.editTranscriptionEditorBody}
                            contentContainerStyle={{ flexGrow: 1 }}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled
                            showsVerticalScrollIndicator={false}
                        >
                            <RichEditor
                                ref={editorRef}
                                initialContentHTML={whatsappToHtml(initialText || "")}
                                style={globalStyles.editTranscriptionInput}
                                placeholder={t("historyTranscription", "editPlaceholder")}
                                initialHeight={140} // ↓ diminui, pra não estourar o card
                                editorStyle={{
                                    backgroundColor: "transparent",
                                    color: colors.textPrimary,
                                    placeholderColor: colors.textDisabled,
                                    contentCSSText: `
                                        font-size: 13px;
                                        padding-bottom: 40px;
                                    `,
                                }}
                                onChange={handleChange}
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
