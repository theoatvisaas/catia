import { Check, Play, Trash2 } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";

type StopActionProps = {
    visible: boolean;
    onClose?: () => void;

    onFinish?: () => void;
    onContinue?: () => void;
    onDiscard?: () => void;

    dismissOnBackdropPress?: boolean;
};

export default function StopAction({
    visible,
    onClose,
    onFinish,
    onContinue,
    onDiscard,
    dismissOnBackdropPress = true,
}: StopActionProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={globalStyles.stopActionOverlay}>
                <Pressable
                    style={globalStyles.stopActionBackdrop}
                    onPress={() => {
                        if (dismissOnBackdropPress) onClose?.();
                    }}
                />

                <View style={globalStyles.stopActionSheet}>

                    <Pressable
                        onPress={onFinish}
                        style={({ pressed }) => [
                            globalStyles.stopActionPrimaryButton,
                            pressed && globalStyles.stopActionButtonPressed,
                        ]}
                    >
                        <View style={globalStyles.stopActionPrimaryIconWrap}>
                            <Check size={18} color={colors.onPrimary} />
                        </View>
                        <Text style={globalStyles.stopActionPrimaryText}>Terminar</Text>
                    </Pressable>

                    <Pressable
                        onPress={onContinue}
                        style={({ pressed }) => [
                            globalStyles.stopActionSecondaryButton,
                            pressed && globalStyles.stopActionButtonPressed,
                        ]}
                    >
                        <View style={globalStyles.stopActionSecondaryIconWrap}>
                            <Play size={18} color={colors.primary} />
                        </View>
                        <Text style={globalStyles.stopActionSecondaryText}>Continuar</Text>
                    </Pressable>

                    <Pressable
                        onPress={onDiscard}
                        style={({ pressed }) => [
                            globalStyles.stopActionDiscardRow,
                            pressed && globalStyles.stopActionDiscardPressed,
                        ]}
                    >
                        <Trash2 size={16} color={colors.textTertiary} />
                        <Text style={globalStyles.stopActionDiscardText}>Descartar</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}
