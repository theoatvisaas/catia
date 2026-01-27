import { router } from "expo-router";
import { ChevronDown, TriangleAlert } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomBar from "../../../components/app/BottomBar";
import { t } from "../../../i18n";
import { globalStyles } from "../../../styles/theme";
import { colors } from "../../../styles/theme/colors";

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();

    const [name, setName] = useState("Théo");
    const [crmv, setCrmv] = useState("");
    const [email, setEmail] = useState("theomcortez@gmail.com");
    const [specialty, setSpecialty] = useState("Veterinário");

    const [planRemaining] = useState(4);

    const specialties = useMemo(
        () => ["Veterinário", "Médico", "Dentista"],
        []
    );

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
                    <Text style={globalStyles.settingsSectionTitle}>
                        {t("settings", "completeProfileTitle")}
                    </Text>
                    <Text style={globalStyles.settingsSectionSubtitle}>
                        {t("settings", "completeProfileSubtitle")}
                    </Text>

                    <Text style={globalStyles.settingsFieldLabel}>
                        {t("settings", "nameLabel")} *
                    </Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        style={globalStyles.settingsInput}
                        autoCapitalize="words"
                    />

                    <Text style={globalStyles.settingsFieldLabel}>
                        {t("settings", "licenseLabel")}
                    </Text>
                    <TextInput
                        value={crmv}
                        onChangeText={setCrmv}
                        style={globalStyles.settingsInput}
                        placeholder={t("settings", "licensePlaceholder")}
                    />

                    <Text style={globalStyles.settingsFieldLabel}>
                        {t("auth", "emailLabel")} *
                    </Text>
                    <View style={globalStyles.settingsSelectLike}>
                        <Text style={globalStyles.settingsSelectText}>{email}</Text>
                        <ChevronDown size={18} color={colors.textSecondary} />
                    </View>

                    <Text style={globalStyles.settingsFieldLabel}>
                        {t("settings", "specialtyLabel")}
                    </Text>
                    <Pressable style={globalStyles.settingsSelectLike}>
                        <Text style={globalStyles.settingsSelectText}>{specialty}</Text>
                        <ChevronDown size={18} color={colors.textSecondary} />
                    </Pressable>

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
                            onPress={() => {
                                console.log("Salvar perfil");
                            }}
                        >
                            <Text style={globalStyles.settingsSaveButtonText}>
                                {t("common", "save")}
                            </Text>
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
                        onPress={() => router.replace("/login")}
                    >
                        <Text style={globalStyles.settingsGhostButtonText}>
                            {t("settings", "logoutButton")}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>

            <BottomBar />
        </View>
    );
}
