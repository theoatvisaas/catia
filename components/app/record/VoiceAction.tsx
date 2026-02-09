import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";
import { Square } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";

type VoiceActionProps = {
    visible: boolean;
    isRecording?: boolean;
    elapsed?: string;
    maxDuration?: string;
    onStop?: () => void;
};

export default function VoiceAction({
    visible,
    isRecording = true,
    elapsed = "00:00:00",
    maxDuration = "01:30:00",
    onStop,
}: VoiceActionProps) {

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
            globalStyles.voiceActionBackdrop,
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
            globalStyles.voiceActionContainer,
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
        <View style={globalStyles.voiceActionOverlay} pointerEvents="box-none">
            <Animated.View style={backdropStyle} />

            <Animated.View style={sheetStyle}>
                <View style={globalStyles.voiceActionBars}>
                    <View style={globalStyles.voiceActionBar} />
                    <View style={globalStyles.voiceActionBarTall} />
                    <View style={globalStyles.voiceActionBar} />
                    <View style={globalStyles.voiceActionBarShort} />
                </View>

                <Pressable
                    onPress={onStop}
                    style={({ pressed }) => [
                        globalStyles.voiceActionButton,
                        pressed && globalStyles.voiceActionButtonPressed,
                    ]}
                >
                    <View style={globalStyles.voiceActionIconWrap}>
                        <Square size={18} color={colors.textPrimary} />
                    </View>

                    <Text style={globalStyles.voiceActionButtonText}>
                        {isRecording ? "Parar" : "Continuar"}
                    </Text>
                </Pressable>

                <Text style={globalStyles.voiceActionTime}>
                    {elapsed} / {maxDuration}
                </Text>
            </Animated.View>
        </View>
    );
}
