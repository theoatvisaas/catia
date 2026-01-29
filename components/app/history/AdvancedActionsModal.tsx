"use client";

import { ChevronRight, X } from "lucide-react-native";
import React, { useMemo } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { t } from "@/i18n";
import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";

export type AdvancedActionKey =
    | "messageResponsible"
    | "referralOtherProfessional"
    | "thankYouReferral"
    | "examResults";

type AdvancedActionsModalProps = {
    visible: boolean;
    onClose: () => void;
    onSelect: (action: AdvancedActionKey) => void;
};

export default function AdvancedActionsModal({
    visible,
    onClose,
    onSelect,
}: AdvancedActionsModalProps) {
    const insets = useSafeAreaInsets();

    const actions = useMemo(
        () =>
            [
                {
                    key: "messageResponsible" as const,
                    title: t("advancedActionsModal", "messageResponsibleTitle"),
                    subtitle: t("advancedActionsModal", "messageResponsibleSubtitle"),
                },
                {
                    key: "referralOtherProfessional" as const,
                    title: t("advancedActionsModal", "referralOtherProfessionalTitle"),
                    subtitle: t("advancedActionsModal", "referralOtherProfessionalSubtitle"),
                },
                {
                    key: "thankYouReferral" as const,
                    title: t("advancedActionsModal", "thankYouReferralTitle"),
                    subtitle: t("advancedActionsModal", "thankYouReferralSubtitle"),
                },
                {
                    key: "examResults" as const,
                    title: t("advancedActionsModal", "examResultsTitle"),
                    subtitle: t("advancedActionsModal", "examResultsSubtitle"),
                },
            ] as const,
        [t]
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <Pressable style={globalStyles.advancedActionsBackdrop}>
                <Pressable
                    onPress={() => { }}
                    style={[
                        globalStyles.advancedActionsSheet,
                        { paddingBottom: Math.max(insets.bottom, 10) },
                    ]}
                >
                    <View style={globalStyles.advancedActionsHeader}>
                        <Text style={globalStyles.advancedActionsTitle}>
                            {t("advancedActionsModal", "title")}
                        </Text>

                        <Pressable
                            onPress={onClose}
                            hitSlop={20}
                            style={({ pressed }) => [
                                globalStyles.advancedActionsCloseBtn,
                                pressed ? globalStyles.advancedActionsCloseBtnPressed : null,
                            ]}
                        >
                            <X size={30} color={colors.textSecondary} />
                        </Pressable>
                    </View>

                    <View style={globalStyles.advancedActionsDivider} />

                    <ScrollView
                        style={globalStyles.advancedActionsList}
                        contentContainerStyle={{ paddingBottom: 4 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {actions.map((item, idx) => {
                            const isLast = idx === actions.length - 1;

                            return (
                                <View key={item.key}>
                                    <Pressable
                                        onPress={() => onSelect(item.key)}
                                        style={({ pressed }) => [
                                            globalStyles.advancedActionsItem,
                                            pressed ? globalStyles.advancedActionsItemPressed : null,
                                        ]}
                                    >
                                        <View style={globalStyles.advancedActionsItemLeft}>
                                            <Text style={globalStyles.advancedActionsItemTitle}>
                                                {item.title}
                                            </Text>
                                            <Text style={globalStyles.advancedActionsItemSubtitle}>
                                                {item.subtitle}
                                            </Text>
                                        </View>

                                        <View style={globalStyles.advancedActionsChevron}>
                                            <ChevronRight size={18} color={colors.textTertiary} />
                                        </View>
                                    </Pressable>

                                    {!isLast ? (
                                        <View style={globalStyles.advancedActionsDivider} />
                                    ) : null}
                                </View>
                            );
                        })}

                        <View style={globalStyles.advancedActionsBottomSafe} />
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
