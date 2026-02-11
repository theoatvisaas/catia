import { router } from "expo-router";
import { Check, TriangleAlert } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import {
    ActivityIndicator,
    Animated,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { clearUser } from "@/services/auth/userStorage";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import { useClientStore } from "@/stores/client/useClientStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "../../../i18n";
import { globalStyles } from "../../../styles/theme";
import { colors } from "../../../styles/theme/colors";


type PopupKind = "success" | "error";

type ToastPopupProps = {
    visible: boolean;
    message: string;
    kind?: PopupKind;
};

export function ToastPopup({
    visible,
    message,
    kind = "success",
}: ToastPopupProps) {
    const [mounted, setMounted] = useState(visible);

    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-12)).current;

    useEffect(() => {
        if (visible) {
            setMounted(true);

            opacity.setValue(0);
            translateY.setValue(-12);

            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 220,
                    useNativeDriver: true,
                }),
            ]).start();
            return;
        }

        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 160,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -12,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (finished) setMounted(false);
        });
    }, [visible, opacity, translateY]);

    if (!mounted) return null;

    const Icon = kind === "success" ? Check : TriangleAlert;
    const iconColor = kind === "success" ? colors.success : colors.textSecondary;

    return (
        <View
            pointerEvents="none"
            style={{
                position: "absolute",
                left: 16,
                right: 16,
                top: 50,
                alignItems: "center",
            }}
        >
            <Animated.View
                style={{
                    width: "100%",
                    maxWidth: 520,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                    opacity,
                    transform: [{ translateY }],
                }}
            >
                <Icon size={16} color={iconColor} style={{ marginTop: 1 }} />

                <Text
                    style={[
                        globalStyles.settingsSectionSubtitle,
                        {
                            marginBottom: 0,
                            flex: 1,
                            color: kind === "error" ? colors.textSecondary : colors.textPrimary,
                        },
                    ]}
                >
                    {message}
                </Text>
            </Animated.View>
        </View>
    );
}

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const logout = useAuthStore((s) => s.logout);


    const { client, hydrated, getClient, createClient, updateClient, loading } = useClientStore();

    const [popup, setPopup] = useState<{ visible: boolean; message: string; kind: PopupKind }>({
        visible: false,
        message: "",
        kind: "success",
    });

    function showPopup(message: string, kind: PopupKind = "success") {
        setPopup({ visible: true, message, kind });

        const timeoutId = setTimeout(() => {
            setPopup((p) => ({ ...p, visible: false }));
        }, 2200);

        return () => clearTimeout(timeoutId);
    }

    const email = "theomcortez@gmail.com"

    type ProfileForm = {
        name: string;
        crmv?: string;
        specialty?: string;
    };

    const {
        control,
        handleSubmit,
        reset,
    } = useForm<ProfileForm>({
        defaultValues: {
            name: "",
            crmv: "",
            specialty: "",
        },
    });

    const [planRemaining] = useState(4);

    useEffect(() => {
        if (!hydrated) return;

        getClient().then((c) => {
            reset({
                name: c?.name ?? "",
                crmv: c?.crmv ?? "",
                specialty: c?.specialty ?? "",
            });
        });
    }, [hydrated]);


    async function onSubmit(data: ProfileForm) {
        try {
            if (!client?.id) {
                const created = await createClient({
                    name: data.name,
                    crmv: data.crmv || null,
                    specialty: data.specialty || null,
                });

                reset({
                    name: created.name ?? "",
                    crmv: created.crmv ?? "",
                    specialty: created.specialty ?? "",
                });

                showPopup("Perfil criado com sucesso!", "success");
                return;
            }

            const patch: any = { name: data.name };
            if (data.crmv?.trim()) patch.crmv = data.crmv.trim();
            if (data.specialty?.trim()) patch.specialty = data.specialty.trim();

            const updated = await updateClient({
                id: client.id,
                data: patch,
            });

            reset({
                name: updated.name ?? "",
                crmv: updated.crmv ?? "",
                specialty: updated.specialty ?? "",
            });

            showPopup("Dados atualizados!", "success");
        } catch (e: any) {
            const msg = e?.message ?? e?.response?.data?.message;
            showPopup(msg ?? "Erro ao salvar dados", "error");

            if (msg?.includes("Cliente já existe")) {
                await getClient();
                return;
            }

            console.log("❌ erro ao salvar/criar client:", {
                status: e?.status,
                message: e?.message,
                details: e?.details,
                data: e?.response?.data,
            });
        }
    }





    return (
        <View style={globalStyles.screenWithBottomBar}>
            <View
                style={[
                    globalStyles.topHeader,
                    { paddingTop: Math.max(insets.top, 10) },
                ]}
            >
                <Text style={globalStyles.topHeaderTitle}>
                    {t("settings", "title")}
                </Text>
            </View>

            <ScrollView
                style={globalStyles.settingsScroll}
                contentContainerStyle={[
                    globalStyles.settingsContent,
                    { paddingBottom: 78 + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={globalStyles.settingsBanner}>
                    <View style={globalStyles.settingsBannerRow}>
                        <TriangleAlert
                            size={16}
                            color={colors.textSecondary}
                            style={globalStyles.settingsBannerIcon}
                        />

                        <Text style={globalStyles.settingsBannerText}>
                            {t("settings", "bannerPrefix")}
                            <Text style={globalStyles.settingsBannerStrong}>
                                {planRemaining} {t("settings", "bannerSuffix")}
                            </Text>
                        </Text>
                    </View>
                </View>


                <View style={globalStyles.settingsSection}>
                    <Text style={globalStyles.settingsSectionTitle}>
                        {t("settings", "subscribeTitle")}
                    </Text>
                    <Text style={globalStyles.settingsSectionSubtitle}>
                        {t("settings", "subscribeSubtitle")}
                    </Text>

                    <Pressable
                        style={globalStyles.settingsPrimaryButton}
                        onPress={() => router.push("/subscribe")}
                    >
                        <Text style={globalStyles.settingsPrimaryButtonText}>
                            {t("settings", "subscribeButton")}
                        </Text>
                    </Pressable>
                </View>

                <View style={globalStyles.settingsDivider} />

                <View style={globalStyles.settingsSection}>

                    {/* Cabeçalho da seção de perfil */}
                    {!client?.id ? (
                        <>
                            <Text style={globalStyles.settingsSectionTitle}>
                                {t("settings", "completeProfileTitle")}
                            </Text>
                            <Text style={globalStyles.settingsSectionSubtitle}>
                                {t("settings", "completeProfileSubtitle")}
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={globalStyles.settingsSectionTitle}>
                                {t("settings", "profileTitle")}
                            </Text>
                            {/* <Text style={globalStyles.settingsSectionSubtitle}>
                                Atualize suas informações sempre que precisar.
                                {t("settings", "profileSubtitle")}
                            </Text> */}
                        </>
                    )}


                    <Text style={globalStyles.settingsFieldLabel}>
                        {t("settings", "nameLabel")} *
                    </Text>
                    <Controller
                        control={control}
                        name="name"
                        rules={{ required: true }}
                        render={({ field: { value, onChange } }) => (
                            <TextInput
                                value={value}
                                onChangeText={onChange}
                                style={globalStyles.settingsInput}
                                autoCapitalize="words"
                                placeholder={t("settings", "namePlaceholder")}
                            />
                        )}
                    />



                    <Text style={globalStyles.settingsFieldLabel}>
                        {t("settings", "licenseLabel")}
                    </Text>
                    <Controller
                        control={control}
                        name="crmv"
                        render={({ field: { value, onChange } }) => (
                            <TextInput
                                value={value}
                                onChangeText={onChange}
                                style={globalStyles.settingsInput}
                                placeholder={t("settings", "licensePlaceholder")}
                            />
                        )}
                    />


                    {/* <Text style={globalStyles.settingsFieldLabel}>
                        {t("auth", "emailLabel")} *
                    </Text>
                    <View style={globalStyles.settingsSelectLike}>
                        <Text style={globalStyles.settingsSelectText}>{email}</Text>
                        <ChevronDown size={18} color={colors.textSecondary} />
                    </View> */}

                    {/* <Text style={globalStyles.settingsFieldLabel}>
                        {t("settings", "specialtyLabel")}
                    </Text>
                    <Controller
                        control={control}
                        name="specialty"
                        render={({ field: { value } }) => (
                            <Pressable style={globalStyles.settingsSelectLike}>
                                <Text style={globalStyles.settingsSelectText}>
                                    {value}
                                </Text>
                                <ChevronDown size={18} color={colors.textSecondary} />
                            </Pressable>
                        )}
                    /> */}


                    <View style={globalStyles.settingsActionsRow}>
                        <Pressable
                            style={globalStyles.settingsGhostButton}
                            onPress={() => router.push("/change-password")}
                        >
                            <Text style={globalStyles.settingsGhostButtonText}>
                                {t("settings", "changePassword")}
                            </Text>
                        </Pressable>

                        <Pressable
                            style={globalStyles.settingsSaveButton}
                            disabled={loading}
                            onPress={handleSubmit(onSubmit)}
                        >
                            {loading ? (
                                <ActivityIndicator />
                            ) : (
                                <Text style={globalStyles.settingsSaveButtonText}>
                                    {t("common", "save")}
                                </Text>
                            )}
                        </Pressable>


                    </View>
                </View>

                <View style={globalStyles.settingsDivider} />

                <View style={globalStyles.settingsSection}>
                    <Text style={globalStyles.settingsSectionTitle}>
                        {t("settings", "shareTitle")}
                    </Text>
                    <Text style={globalStyles.settingsSectionSubtitle}>
                        {t("settings", "shareSubtitle")}
                    </Text>

                    <Pressable
                        style={globalStyles.settingsPrimaryButton}
                        onPress={() => router.push("/share")}
                    >
                        <Text style={globalStyles.settingsPrimaryButtonText}>
                            {t("settings", "shareButton")}
                        </Text>
                    </Pressable>
                </View>

                <View style={globalStyles.settingsDivider} />

                <View style={globalStyles.settingsSection}>
                    <Text style={globalStyles.settingsSectionTitle}>
                        {t("settings", "supportTitle")}
                    </Text>
                    <Text style={globalStyles.settingsSectionSubtitle}>
                        {t("settings", "supportSubtitle")}
                    </Text>

                    <Pressable
                        style={globalStyles.settingsPrimaryButton}
                        onPress={() => router.push("/support")}
                    >
                        <Text style={globalStyles.settingsPrimaryButtonText}>
                            {t("settings", "supportButton")}
                        </Text>
                    </Pressable>
                </View>

                <View style={globalStyles.settingsDivider} />

                <View style={globalStyles.settingsSection}>
                    <Text style={globalStyles.settingsSectionTitle}>
                        {t("settings", "logoutTitle")}
                    </Text>

                    <Pressable
                        style={globalStyles.settingsGhostButton}
                        onPress={async () => {
                            useClientStore.getState().clearClient();
                            await AsyncStorage.removeItem("client-store");
                            await clearUser();
                            await logout();
                            router.replace("/login");
                        }}

                    >
                        <Text style={globalStyles.settingsGhostButtonText}>
                            {t("settings", "logoutButton")}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>

            <ToastPopup
                visible={popup.visible}
                message={popup.message}
                kind={popup.kind}
            />


        </View>
    );
}
