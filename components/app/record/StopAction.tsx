import { Check, Play, Trash2 } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Modal, Pressable, Text, View } from "react-native";

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

    const [mounted, setMounted] = useState(visible);
    const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;

    useEffect(() => {
        if (visible) setMounted(true);

        Animated.timing(progress, {
            toValue: visible ? 1 : 0,
            duration: visible ? 460 : 400,
            easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished && !visible) setMounted(false);
        });
    }, [visible, progress]);

    const backdropStyle = useMemo(
        () => [
            globalStyles.stopActionBackdrop,
            {
                opacity: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                }),
            },
        ],
        [progress]
    );

    const sheetStyle = useMemo(
        () => [
            globalStyles.stopActionSheet,
            {
                transform: [
                    {
                        translateY: progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [28, 0],
                        }),
                    },
                    {
                        scale: progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.98, 1],
                        }),
                    },
                ],
                opacity: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                }),
            },
        ],
        [progress]
    );

    if (!mounted) return null;

    return (
        <Modal
            visible={mounted}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={globalStyles.stopActionOverlay}>
                <Pressable
                    style={{ flex: 1 }}
                    onPress={() => {
                        if (dismissOnBackdropPress) onClose?.();
                    }}
                >
                    <Animated.View style={backdropStyle} />
                </Pressable>

                <Animated.View style={sheetStyle}>
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
                </Animated.View>
            </View>
        </Modal>
    );
}
