import { globalStyles } from "@/styles/theme";
import { Audio, AVPlaybackStatus } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";

const TAG = "[AudioPreviewPlayer]";

type Props = {
    uri: string;
    durationSeconds?: number;
};

export default function AudioPreviewPlayer({ uri, durationSeconds }: Props) {
    const soundRef = useRef<Audio.Sound | null>(null);
    const [playing, setPlaying] = useState(false);
    const [finished, setFinished] = useState(false);

    const loadSound = async () => {
        if (soundRef.current) {
            console.log(`${TAG} loadSound() | Sound already loaded, skipping`);
            return;
        }

        console.log(`${TAG} loadSound() | Creating sound from URI: ${uri}`);
        try {
            const { sound, status } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: false }
            );

            soundRef.current = sound;

            if (status.isLoaded) {
                console.log(
                    `${TAG} loadSound() | ✅ Sound loaded | ` +
                    `duration=${status.durationMillis}ms | ` +
                    `position=${status.positionMillis}ms`
                );
            } else {
                console.warn(`${TAG} loadSound() | Sound created but not loaded`);
            }

            sound.setOnPlaybackStatusUpdate((s: AVPlaybackStatus) => {
                if (!s.isLoaded) {
                    if (s.error) {
                        console.error(`${TAG} onPlaybackStatus | Error: ${s.error}`);
                    }
                    return;
                }

                setPlaying(s.isPlaying);

                if (s.didJustFinish) {
                    console.log(`${TAG} onPlaybackStatus | ✅ Playback finished`);
                    setFinished(true);
                    setPlaying(false);
                }
            });
        } catch (err) {
            console.error(`${TAG} loadSound() | ❌ Failed to create sound:`, err);
        }
    };

    const togglePlay = async () => {
        console.log(`${TAG} togglePlay() | playing=${playing} | finished=${finished}`);

        await loadSound();

        if (!soundRef.current) {
            console.warn(`${TAG} togglePlay() | No sound ref after loadSound()`);
            return;
        }

        const status = await soundRef.current.getStatusAsync();
        if (!status.isLoaded) {
            console.warn(`${TAG} togglePlay() | Sound not loaded`);
            return;
        }

        console.log(
            `${TAG} togglePlay() | status: isPlaying=${status.isPlaying} | ` +
            `position=${status.positionMillis}ms | duration=${status.durationMillis}ms | ` +
            `didJustFinish=${status.didJustFinish}`
        );

        if (status.isPlaying) {
            console.log(`${TAG} togglePlay() | Pausing...`);
            await soundRef.current.pauseAsync();
        } else {
            // If playback finished or position is at/near the end, seek to 0 first
            const atEnd =
                finished ||
                (status.durationMillis != null &&
                    status.positionMillis >= status.durationMillis - 100);

            if (atEnd) {
                console.log(`${TAG} togglePlay() | At end, seeking to 0 before playing`);
                await soundRef.current.setPositionAsync(0);
                setFinished(false);
            }

            console.log(`${TAG} togglePlay() | Playing...`);
            await soundRef.current.playAsync();
        }
    };

    useEffect(() => {
        return () => {
            console.log(`${TAG} cleanup | Unloading sound`);
            soundRef.current?.unloadAsync();
        };
    }, []);

    // Build button label with actual duration
    const buttonLabel = (() => {
        if (playing) return "Pausar áudio";
        if (durationSeconds != null && durationSeconds > 0) {
            return `Ouça os últimos ${durationSeconds}s gravados`;
        }
        return "Ouvir áudio";
    })();

    return (
        <View style={{ marginTop: 16 }}>
            <Pressable
                onPress={togglePlay}
                style={globalStyles.newRecordMicButton}
            >
                <Text style={globalStyles.newRecordMicText}>
                    {buttonLabel}
                </Text>
            </Pressable>
        </View>
    );
}
