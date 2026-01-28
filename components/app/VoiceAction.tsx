import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";
import { Square } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";

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
    if (!visible) return null;

    return (
        <View style={globalStyles.voiceActionOverlay}>

            <View style={globalStyles.voiceActionBackdrop} />


            <View style={globalStyles.voiceActionContainer}>
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
            </View>
        </View>
    );
}
