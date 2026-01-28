import StopAction from "@/components/app/StopAction";
import UploadRecord from "@/components/app/UploadRecord";
import VoiceAction from "@/components/app/VoiceAction";
import { t } from "@/i18n";
import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";
import { router } from "expo-router";
import { Mic, TriangleAlert } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SexKey = "male" | "female" | null;

export default function NewRecordScreen() {
    const insets = useSafeAreaInsets();

    const [patientName, setPatientName] = useState("");
    const [guardianName, setGuardianName] = useState("");
    const [sex, setSex] = useState<SexKey>(null);
    const [uploading, setUploading] = useState(false);

    const [recording, setRecording] = useState(false);
    const [stopOpen, setStopOpen] = useState(false);

    const [headerHeight, setHeaderHeight] = useState(0);

    useEffect(() => {
        if (!uploading) return;

        const timer = setTimeout(() => {
            router.replace("/history/loading");
        }, 2000);

        return () => clearTimeout(timer);
    }, [uploading]);

    const reports = useMemo(
        () => [
            { title: t("newRecord", "report1Title"), desc: t("newRecord", "report1Desc") },
            { title: t("newRecord", "report2Title"), desc: t("newRecord", "report2Desc") },
            { title: t("newRecord", "report3Title"), desc: t("newRecord", "report3Desc") },
            { title: t("newRecord", "report4Title"), desc: t("newRecord", "report4Desc") },
        ],
        []
    );

    const handleStart = () => {
        setStopOpen(false);
        setRecording(true);
    };

    const handleStop = () => {
        setRecording(false);
        setStopOpen(true);
    };

    const handleCloseStop = () => {
        setStopOpen(false);
    };

    const handleContinue = () => {
        setStopOpen(false);
        setRecording(true);
    };

    const handleFinish = () => {
        setStopOpen(false);
        setRecording(false);
        setUploading(true);
    };

    const handleDiscard = () => {
        setStopOpen(false);
        setRecording(false);
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
                    { paddingBottom: ((recording || stopOpen) ? 200 : 78) + insets.bottom },
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
                        <Text style={globalStyles.newRecordMicText}>{t("newRecord", "record")}</Text>
                    </Pressable>
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
                visible={recording}
                elapsed="00:00:09"
                maxDuration="01:30:00"
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
