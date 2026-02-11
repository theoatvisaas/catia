import AudioPreviewPlayer from "@/components/app/record/AudioPreviewPlayer";
import StopAction from "@/components/app/record/StopAction";
import UploadRecord from "@/components/app/record/UploadRecord";
import VoiceAction from "@/components/app/record/VoiceAction";
import { t } from "@/i18n";
import { useRecorder } from "@/providers/RecordProvider";
import { getUser } from "@/services/auth/userStorage";
import { useUploadStore } from "@/stores/record/useUploadStore";
import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";
import { Mic, TriangleAlert } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SexKey = "male" | "female" | null;

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

function formatHMS(ms: number) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

export default function NewRecordScreen() {
    const insets = useSafeAreaInsets();

    const [patientName, setPatientName] = useState("");
    const [guardianName, setGuardianName] = useState("");
    const [sex, setSex] = useState<SexKey>(null);
    const [uploading, setUploading] = useState(false);

    const uploadRecording = useUploadStore((s) => s.uploadRecording);


    const [recordedUri, setRecordedUri] = useState<string | null>(null);

    const [stopOpen, setStopOpen] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(0);

    const audio = useRecorder();
    const recording = audio.isRecording;
    const isPaused = audio.isPaused;

    const elapsedLabel = formatHMS(audio.durationMs ?? 0);
    const maxDurationLabel = "01:30:00";

    const reports = useMemo(
        () => [
            { title: t("newRecord", "report1Title"), desc: t("newRecord", "report1Desc") },
            { title: t("newRecord", "report2Title"), desc: t("newRecord", "report2Desc") },
            { title: t("newRecord", "report3Title"), desc: t("newRecord", "report3Desc") },
            { title: t("newRecord", "report4Title"), desc: t("newRecord", "report4Desc") },
        ],
        []
    );

    const handleCloseStop = () => {
        setStopOpen(false);
    };

    const handleStart = async () => {
        if (stopOpen || uploading) return;

        // Se já está gravando, ignora
        if (recording) return;

        // Se está pausado, retoma
        if (isPaused) {
            try {
                await audio.resume();
            } catch { }
            return;
        }

        try {
            await audio.start();
        } catch (e) {
            // opcional: toast/log
        }
    };

    const handleStop = async () => {
        try {
            await audio.pause();
        } catch { }

        setStopOpen(true);
    };

    const handleContinue = async () => {
        setStopOpen(false);

        try {
            await audio.resume();
        } catch { }
    };

    const handleFinish = async () => {
        setStopOpen(false);

        try {
            const user = await getUser();
            console.log(user?.user)
            if (!user?.user.id) {
                console.log("User not found in storage");
                return;
            }

            const uri = await audio.finish();
            if (!uri) return;

            setRecordedUri(uri);

            const durationMs = audio.durationMs ?? 0;
            setUploading(true);

            await uploadRecording({
                uri,
                userId: user.user.id,
                patientName,
                guardianName,
                sex,
                durationMs,
            });
        } catch (e) {
            console.log("handleFinish error:", e);
        } finally {
            setUploading(false);
        }
    };


    const handleDiscard = async () => {
        setStopOpen(false);
        await audio.discard();
    };

    return (
        <View style={globalStyles.screenWithBottomBar}>
            <View
                onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
                style={[globalStyles.topHeader, { paddingTop: Math.max(insets.top, 10) }]}
            >
                <Text style={globalStyles.topHeaderTitle}>{t("newRecord", "title")}</Text>
            </View>

            <ScrollView
                style={globalStyles.newRecordScroll}
                contentContainerStyle={[
                    globalStyles.newRecordContent,
                    { paddingBottom: (recording || stopOpen ? 200 : 78) + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={globalStyles.newRecordCard}>
                    <Text style={globalStyles.newRecordCardTitle}>{t("newRecord", "cardTitle")}</Text>

                    <Text style={globalStyles.newRecordFieldLabel}>{t("newRecord", "patientLabel")}</Text>
                    <TextInput
                        value={patientName}
                        onChangeText={setPatientName}
                        style={globalStyles.newRecordInput}
                        placeholder=""
                    />

                    <Text style={[globalStyles.newRecordFieldLabel, { marginTop: 14 }]}>
                        {t("newRecord", "guardianLabel")}
                    </Text>
                    <TextInput
                        value={guardianName}
                        onChangeText={setGuardianName}
                        style={globalStyles.newRecordInput}
                        placeholder=""
                    />

                    <View style={globalStyles.newRecordSegmentRow}>
                        <Pressable
                            style={[
                                globalStyles.newRecordSegment,
                                sex === "male" && globalStyles.newRecordSegmentActive,
                            ]}
                            onPress={() => setSex("male")}
                        >
                            <Text
                                style={[
                                    globalStyles.newRecordSegmentText,
                                    sex === "male" && globalStyles.newRecordSegmentTextActive,
                                ]}
                            >
                                {t("newRecord", "male")}
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                globalStyles.newRecordSegment,
                                sex === "female" && globalStyles.newRecordSegmentActive,
                            ]}
                            onPress={() => setSex("female")}
                        >
                            <Text
                                style={[
                                    globalStyles.newRecordSegmentText,
                                    sex === "female" && globalStyles.newRecordSegmentTextActive,
                                ]}
                            >
                                {t("newRecord", "female")}
                            </Text>
                        </Pressable>
                    </View>

                    <Pressable style={globalStyles.newRecordMicButton} onPress={handleStart}>
                        <Mic size={28} color={colors.onPrimary} />
                        <Text style={globalStyles.newRecordMicText}>
                            {isPaused ? "Continuar" : t("newRecord", "record")}
                        </Text>
                    </Pressable>

                    {recordedUri && <AudioPreviewPlayer uri={recordedUri} />}

                </View>

                <View style={globalStyles.newRecordInfoRow}>
                    <TriangleAlert size={16} color={colors.warning} style={globalStyles.newRecordInfoIcon} />
                    <Text style={globalStyles.newRecordInfoText}>
                        <Text style={globalStyles.newRecordInfoStrong}>{t("newRecord", "importantStrong")}</Text>{" "}
                        {t("newRecord", "importantText")}
                    </Text>
                </View>

                <View style={globalStyles.newRecordCard}>
                    <Text style={globalStyles.newRecordGuideTitle}>{t("newRecord", "guideTitle")}</Text>

                    <Text style={globalStyles.newRecordGuideText}>{t("newRecord", "guideParagraph1")}</Text>

                    <Text style={[globalStyles.newRecordGuideText, { marginTop: 12 }]}>
                        {t("newRecord", "guideParagraph2")}
                    </Text>

                    <View style={globalStyles.newRecordBulletList}>
                        {reports.map((r, idx) => (
                            <View key={idx} style={globalStyles.newRecordBulletRow}>
                                <Text style={globalStyles.newRecordBulletDot}>•</Text>
                                <Text style={globalStyles.newRecordBulletText}>
                                    <Text style={globalStyles.newRecordBulletStrong}>{r.title}</Text>{" "}
                                    {r.desc}
                                </Text>
                            </View>
                        ))}
                    </View>

                    <Text style={[globalStyles.newRecordGuideText, { marginTop: 12 }]}>
                        {t("newRecord", "guideFooter")}
                    </Text>
                </View>
            </ScrollView>

            <VoiceAction
                visible={recording && !stopOpen}
                elapsed={elapsedLabel}
                maxDuration={maxDurationLabel}
                onStop={handleStop}
            />

            <StopAction
                visible={stopOpen}
                onClose={handleCloseStop}
                onFinish={handleFinish}
                onContinue={handleContinue}
                onDiscard={handleDiscard}
            />

            <UploadRecord visible={uploading} topOffset={headerHeight} />
        </View>
    );
}
