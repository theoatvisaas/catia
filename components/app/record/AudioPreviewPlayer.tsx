import { globalStyles } from "@/styles/theme";
import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
    uri: string;
};

export default function AudioPreviewPlayer({ uri }: Props) {
    const soundRef = useRef<Audio.Sound | null>(null);
    const [playing, setPlaying] = useState(false);

    const loadSound = async () => {
        if (soundRef.current) return;

        const { sound } = await Audio.Sound.createAsync(
            { uri },
            { shouldPlay: false }
        );

        soundRef.current = sound;

        sound.setOnPlaybackStatusUpdate((status) => {
            if (!status.isLoaded) return;
            setPlaying(status.isPlaying);
        });
    };

    const togglePlay = async () => {
        await loadSound();

        if (!soundRef.current) return;

        const status = await soundRef.current.getStatusAsync();
        if (!status.isLoaded) return;

        if (status.isPlaying) {
            await soundRef.current.pauseAsync();
        } else {
            await soundRef.current.playAsync();
        }
    };

    useEffect(() => {
        return () => {
            soundRef.current?.unloadAsync();
        };
    }, []);

    return (
        <View style={{ marginTop: 16 }}>
            <Pressable
                onPress={togglePlay}
                style={globalStyles.newRecordMicButton}
            >
                <Text style={globalStyles.newRecordMicText}>
                    {playing ? "Pausar áudio" : "Ouvir áudio"}
                </Text>
            </Pressable>
        </View>
    );
}
