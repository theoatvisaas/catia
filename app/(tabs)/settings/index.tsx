import { router } from "expo-router";
import { TriangleAlert } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { showToast } from "@/providers/ToastProvider";
import { clearUser } from "@/services/auth/userStorage";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import { usePlansStore } from "@/stores/billing/usePlansStore";
import { useClientStore } from "@/stores/client/useClientStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "../../../i18n";
import { globalStyles } from "../../../styles/theme";
import { colors } from "../../../styles/theme/colors";
import { DevTestPanel } from "@/components/dev/DevTestPanel";


export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const logout = useAuthStore((s) => s.logout);


    const { client, hydrated, updateClient, loading } = useClientStore();
    const plansFetched = usePlansStore((s) => s.fetched);

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

    // Populate form from prefetched client data (no fetch on mount)
    useEffect(() => {
        if (!hydrated || !client) return;
        reset({
            name: client.name ?? "",
            crmv: client.crmv ?? "",
            specialty: client.specialty ?? "",
        });
    }, [hydrated, client]);

    // Fetch plans once when Settings mounts (consumed by Subscribe screen)
    useEffect(() => {
        if (plansFetched) return;
        usePlansStore.getState().listPlans().catch((err) => {
            console.warn("[Settings] Plans fetch error:", err);
            showToast("Erro ao carregar planos.");
        });
    }, [plansFetched]);

    async function onSubmit(data: ProfileForm) {
        if (!client?.id) return;

        try {
            const patch: any = { name: data.name };
            if (data.crmv?.trim()) patch.crmv = data.crmv.trim();
            if (data.specialty?.trim()) patch.specialty = data.specialty.trim();

            await updateClient({
                id: client.id,
                data: patch,
            });

            showToast("Dados atualizados!", "success");
        } catch (e: any) {
            console.warn("❌ erro ao salvar client:", {
                status: e?.status,
                message: e?.message,
            });
            showToast("Erro ao salvar dados. Verifique sua conexão e tente novamente.");
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
                            try {
                                useClientStore.getState().clearClient();
                                await AsyncStorage.removeItem("client-store");
                                await clearUser();
                                await logout();
                                router.replace("/login");
                            } catch (e) {
                                console.warn("❌ erro ao fazer logout:", e);
                                showToast("Erro ao sair. Tente novamente.");
                            }
                        }}
                    >
                        <Text style={globalStyles.settingsGhostButtonText}>
                            {t("settings", "logoutButton")}
                        </Text>
                    </Pressable>
                </View>

                {__DEV__ && (
                    <>
                        <View style={globalStyles.settingsDivider} />
                        <View style={globalStyles.settingsSection}>
                            <DevTestPanel />
                        </View>
                    </>
                )}
            </ScrollView>

        </View>
    );
}
