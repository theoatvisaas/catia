import AudioPreviewPlayer from "@/components/app/record/AudioPreviewPlayer";
import StopAction from "@/components/app/record/StopAction";
import UploadRecord from "@/components/app/record/UploadRecord";
import VoiceAction from "@/components/app/record/VoiceAction";
import { t } from "@/i18n";
import { useRecorder } from "@/providers/RecordProvider";
import { getUser } from "@/services/auth/userStorage";
import { useConsultationStore } from "@/stores/consultation/useConsultationStore";
import { buildAudioPreview } from "@/services/recordings/audioPreviewBuilder";
import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";
import { Mic, TriangleAlert } from "lucide-react-native";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, AppState, Linking, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { retrySyncConsultation, finalizeConsultation } from "@/services/recordings/consultationSyncService";
import { Check } from "lucide-react-native";

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
    const router = useRouter();
    const { resumeSessionId } = useLocalSearchParams<{ resumeSessionId?: string }>();
    const isResuming = !!resumeSessionId;

    const [patientName, setPatientName] = useState("");
    const [guardianName, setGuardianName] = useState("");
    const [sex, setSex] = useState<SexKey>(null);
    const [uploading, setUploading] = useState(false);
    const [finalizing, setFinalizing] = useState(false);

    const [recordedUri, setRecordedUri] = useState<string | null>(null);

    const [stopOpen, setStopOpen] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(0);

    // Resume mode state
    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const [previewDuration, setPreviewDuration] = useState<number | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);

    const audio = useRecorder();
    const recording = audio.isRecording;
    const isPaused = audio.isPaused;

    // ── Pre-fill fields from existing consultation when resuming ──
    useEffect(() => {
        if (!resumeSessionId) return;

        const consultation = useConsultationStore.getState().getConsultation(resumeSessionId);
        if (!consultation) return;

        setPatientName(consultation.patientName || "");
        setGuardianName(consultation.guardianName || "");
        setSex(consultation.sex || null);
    }, [resumeSessionId]);

    // ── Build audio preview when resuming ──
    useEffect(() => {
        if (!resumeSessionId) return;

        let cancelled = false;
        setPreviewLoading(true);
        setPreviewError(null);

        buildAudioPreview(resumeSessionId)
            .then((result) => {
                if (cancelled) return;
                setPreviewUri(result?.uri ?? null);
                setPreviewDuration(result?.durationSeconds ?? null);
                setPreviewLoading(false);
            })
            .catch((err) => {
                if (cancelled) return;
                console.warn("[NewRecord] buildAudioPreview error:", err);
                setPreviewError("Não foi possível carregar o áudio");
                setPreviewLoading(false);
            });

        return () => {
            cancelled = true;
            // Cleanup temp preview file on unmount
            if (previewUri) {
                FileSystem.deleteAsync(previewUri, { idempotent: true }).catch(() => {});
            }
        };
    }, [resumeSessionId]);

    const elapsedLabel = formatHMS(audio.durationMs ?? 0);
    const maxDurationLabel = "01:30:00";

    // Track whether alerts were already shown to avoid duplicate alerts
    const streamDeadAlertShown = useRef(false);
    const diskFullAlertShown = useRef(false);

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
            const user = await getUser();
            if (!user?.user.id) {
                console.log("User not found in storage");
                return;
            }

            await audio.start({
                userId: user.user.id,
                patientName,
                guardianName,
                sex,
                ...(resumeSessionId ? { resumeSessionId } : {}),
            });
        } catch (e: any) {
            const msg = e?.message ?? String(e);
            console.log("handleStart error:", msg);

            // Check if it's a notification permission error
            if (msg.toLowerCase().includes("permissao de notificacao") || msg.toLowerCase().includes("notification")) {
                const notifInstructions = Platform.OS === "ios"
                    ? "Para ativar as notificações:\n\n" +
                      "1. Abra os Ajustes do iPhone\n" +
                      "2. Role para baixo e toque em \"CatIA\"\n" +
                      "3. Toque em \"Notificações\"\n" +
                      "4. Ative \"Permitir Notificações\"\n" +
                      "5. Volte ao app e tente novamente"
                    : "Para ativar as notificações:\n\n" +
                      "1. Abra as Configurações do celular\n" +
                      "2. Toque em \"Apps\" → \"CatIA\"\n" +
                      "3. Toque em \"Notificações\"\n" +
                      "4. Ative \"Mostrar notificações\"\n" +
                      "5. Volte ao app e tente novamente";

                Alert.alert(
                    "Permissão de Notificação Necessária",
                    "O CatIA precisa enviar notificações para avisar sobre problemas durante a gravação, mesmo quando você está em outro app.\n\n" + notifInstructions,
                    [
                        { text: "Cancelar", style: "cancel" },
                        {
                            text: "Abrir Ajustes",
                            onPress: () => Linking.openSettings(),
                        },
                    ]
                );
                return;
            }

            // Check if it's a mic permission error
            if (msg.toLowerCase().includes("permissao de microfone") || msg.toLowerCase().includes("permission")) {
                const instructions = Platform.OS === "ios"
                    ? "Para ativar o microfone:\n\n" +
                      "1. Abra os Ajustes do iPhone\n" +
                      "2. Role para baixo e toque em \"CatIA\"\n" +
                      "3. Ative a opção \"Microfone\"\n" +
                      "4. Volte ao app e tente novamente"
                    : "Para ativar o microfone:\n\n" +
                      "1. Abra as Configurações do celular\n" +
                      "2. Toque em \"Apps\" → \"CatIA\"\n" +
                      "3. Toque em \"Permissões\"\n" +
                      "4. Ative \"Microfone\"\n" +
                      "5. Volte ao app e tente novamente";

                Alert.alert(
                    "Permissão de Microfone Necessária",
                    "O CatIA precisa de acesso ao microfone para gravar consultas.\n\n" + instructions,
                    [
                        { text: "Cancelar", style: "cancel" },
                        {
                            text: "Abrir Ajustes",
                            onPress: () => Linking.openSettings(),
                        },
                    ]
                );
            }
        }
    };

    // ── Finalize interrupted recording without resuming ──
    const handleFinalizeResume = async () => {
        if (!resumeSessionId || finalizing) return;

        setFinalizing(true);
        try {
            const store = useConsultationStore.getState();
            store.updateConsultation(resumeSessionId, {
                userFinalized: true,
                finishedAt: Date.now(),
            });
            store.recomputeSyncStatus(resumeSessionId);

            // Attempt to sync
            const allDone = await retrySyncConsultation(resumeSessionId);
            if (allDone) {
                await finalizeConsultation(resumeSessionId);
            }
        } catch (err) {
            console.warn("[NewRecord] handleFinalizeResume error:", err);
        } finally {
            setFinalizing(false);
            router.back();
        }
    };

    const handleStop = async () => {
        try {
            await audio.pause();
        } catch { }

        setStopOpen(true);
    };

    // ── Alert: stream died (watchdog detected no audio) ─────
    // Defers Alert.alert() until the app is in the foreground to avoid
    // rendering the alert off-screen (iOS bug when alert fires in background).
    useEffect(() => {
        if (audio.streamDead && recording && !streamDeadAlertShown.current) {
            streamDeadAlertShown.current = true;

            const showStreamDeadAlert = () => {
                Alert.alert(
                    "Problema na Gravação",
                    "O microfone parou de enviar áudio. Isso pode acontecer quando outro app usa o microfone ou quando há um problema de hardware.\n\n" +
                    "Os últimos ~10 segundos podem não ter sido gravados. O restante está salvo.",
                    [
                        {
                            text: "Tentar novamente",
                            onPress: async () => {
                                audio.resetStreamDead();
                                streamDeadAlertShown.current = false;
                                try { await audio.resume(); } catch {}
                            },
                        },
                        {
                            text: "Parar e Salvar",
                            onPress: async () => {
                                setStopOpen(false);
                                setUploading(true);
                                try {
                                    await audio.finish();
                                } catch (err) {
                                    console.log("streamDead finish error:", err);
                                } finally {
                                    setUploading(false);
                                }
                            },
                        },
                    ],
                    { cancelable: false }
                );
            };

            if (AppState.currentState === "active") {
                showStreamDeadAlert();
            } else {
                const sub = AppState.addEventListener("change", (state) => {
                    if (state === "active") {
                        sub.remove();
                        showStreamDeadAlert();
                    }
                });
                return () => sub.remove();
            }
        }
        // Reset when not recording anymore
        if (!recording) {
            streamDeadAlertShown.current = false;
        }
    }, [audio.streamDead, recording]);

    // ── Alert: disk full ────────────────────────────────────
    // Same deferred pattern as streamDead above.
    useEffect(() => {
        if (audio.diskFull && recording && !diskFullAlertShown.current) {
            diskFullAlertShown.current = true;

            const showDiskFullAlert = () => {
                Alert.alert(
                    "Problema ao Salvar Gravação",
                    "Houve um erro ao salvar os dados no dispositivo. O armazenamento pode estar cheio.\n\n" +
                    "Recomendamos parar a gravação para não perder o que já foi gravado.",
                    [
                        {
                            text: "Tentar novamente",
                            onPress: async () => {
                                audio.resetDiskFull();
                                diskFullAlertShown.current = false;
                                try { await audio.resume(); } catch {}
                            },
                        },
                        {
                            text: "Parar e Salvar",
                            onPress: async () => {
                                setStopOpen(false);
                                setUploading(true);
                                try {
                                    await audio.finish();
                                } catch (err) {
                                    console.log("diskFull finish error:", err);
                                } finally {
                                    setUploading(false);
                                }
                            },
                        },
                    ],
                    { cancelable: false }
                );
            };

            if (AppState.currentState === "active") {
                showDiskFullAlert();
            } else {
                const sub = AppState.addEventListener("change", (state) => {
                    if (state === "active") {
                        sub.remove();
                        showDiskFullAlert();
                    }
                });
                return () => sub.remove();
            }
        }
        if (!recording) {
            diskFullAlertShown.current = false;
        }
    }, [audio.diskFull, recording]);

    const handleContinue = async () => {
        setStopOpen(false);

        try {
            await audio.resume();
        } catch { }
    };

    const handleFinish = async () => {
        setStopOpen(false);
        setUploading(true);

        try {
            // finish() handles: flush remaining chunks → stop recording →
            // upload full file backup → wait for chunk queue → finalize session
            const uri = await audio.finish();
            if (uri) setRecordedUri(uri);
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
                <Text style={globalStyles.topHeaderTitle}>
                    {isResuming ? "Retomar Gravação" : t("newRecord", "title")}
                </Text>
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
                        style={[
                            globalStyles.newRecordInput,
                            isResuming && { opacity: 0.6, backgroundColor: "#F3F4F6" },
                        ]}
                        placeholder=""
                        editable={!isResuming}
                    />

                    <Text style={[globalStyles.newRecordFieldLabel, { marginTop: 14 }]}>
                        {t("newRecord", "guardianLabel")}
                    </Text>
                    <TextInput
                        value={guardianName}
                        onChangeText={setGuardianName}
                        style={[
                            globalStyles.newRecordInput,
                            isResuming && { opacity: 0.6, backgroundColor: "#F3F4F6" },
                        ]}
                        placeholder=""
                        editable={!isResuming}
                    />

                    <View style={[globalStyles.newRecordSegmentRow, isResuming && { opacity: 0.6 }]}>
                        <Pressable
                            style={[
                                globalStyles.newRecordSegment,
                                sex === "male" && globalStyles.newRecordSegmentActive,
                            ]}
                            onPress={() => !isResuming && setSex("male")}
                            disabled={isResuming}
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
                            onPress={() => !isResuming && setSex("female")}
                            disabled={isResuming}
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

                    {/* ── Resume banner with audio preview ── */}
                    {isResuming && !recording && (
                        <View style={{
                            backgroundColor: "#FFF7ED",
                            borderRadius: 12,
                            padding: 14,
                            marginTop: 16,
                            borderWidth: 1,
                            borderColor: "#FDBA74",
                        }}>
                            <Text style={{ fontSize: 14, fontWeight: "600", color: "#9A3412", marginBottom: 4 }}>
                                Retomando gravação interrompida
                            </Text>
                            <Text style={{ fontSize: 12, color: "#C2410C", marginBottom: 8 }}>
                                {(() => {
                                    const consultation = useConsultationStore.getState().getConsultation(resumeSessionId!);
                                    if (!consultation) return "";
                                    const chunks = consultation.chunks.length;
                                    const duration = consultation.durationMs > 0
                                        ? formatHMS(consultation.durationMs)
                                        : `${chunks * 30}s aprox.`;
                                    return `${chunks} parte${chunks !== 1 ? "s" : ""} já gravada${chunks !== 1 ? "s" : ""} — ${duration}`;
                                })()}
                            </Text>

                            {previewLoading && (
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                    <ActivityIndicator size="small" color="#C2410C" />
                                    <Text style={{ fontSize: 12, color: "#C2410C" }}>Carregando preview...</Text>
                                </View>
                            )}

                            {previewError && (
                                <Text style={{ fontSize: 12, color: colors.error }}>{previewError}</Text>
                            )}

                            {previewUri && !previewLoading && (
                                <AudioPreviewPlayer
                                    uri={previewUri}
                                    durationSeconds={previewDuration ?? undefined}
                                />
                            )}
                        </View>
                    )}

                    {/* ── Finalize button (resume mode only, before recording starts) ── */}
                    {isResuming && !recording && (
                        <Pressable
                            onPress={handleFinalizeResume}
                            disabled={finalizing}
                            style={({ pressed }) => ({
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                marginTop: 16,
                                paddingVertical: 14,
                                borderRadius: 14,
                                borderWidth: 2,
                                borderColor: colors.primary,
                                backgroundColor: pressed ? `${colors.primary}10` : "transparent",
                                opacity: finalizing ? 0.6 : 1,
                            })}
                        >
                            {finalizing ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                                <Check size={20} color={colors.primary} />
                            )}
                            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.primary }}>
                                {finalizing ? "Finalizando..." : "Finalizar Gravação"}
                            </Text>
                        </Pressable>
                    )}

                    <Pressable style={globalStyles.newRecordMicButton} onPress={handleStart}>
                        <Mic size={28} color={colors.onPrimary} />
                        <Text style={globalStyles.newRecordMicText}>
                            {isPaused ? "Continuar" : isResuming ? "Retomar Gravação" : t("newRecord", "record")}
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
