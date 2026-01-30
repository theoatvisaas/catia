// app/(auth)/forgot-password.tsx
"use client";

import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { t } from "@/i18n";
import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";

function LogoIconForgot() {
    const bars = useMemo(
        () => [
            { h: 34, w: 10, mt: 10, ml: 0 },
            { h: 56, w: 12, mt: 0, ml: 8 },
            { h: 76, w: 14, mt: 6, ml: 8 },
            { h: 44, w: 12, mt: 22, ml: 8 },
        ],
        []
    );

    return (
        <View style={globalStyles.forgotLogoWrap}>
            {bars.map((b, i) => (
                <View
                    key={i}
                    style={[
                        globalStyles.forgotLogoBar,
                        {
                            height: b.h,
                            width: b.w,
                            marginTop: b.mt,
                            marginLeft: i === 0 ? 0 : b.ml,
                            backgroundColor: colors.primary,
                        },
                    ]}
                />
            ))}
        </View>
    );
}

export default function ForgotPassword() {
    const [email, setEmail] = useState("");

    return (
        <View style={globalStyles.screen}>
            <View style={globalStyles.container}>
                <View style={globalStyles.forgotHeader}>
                    <LogoIconForgot />

                    <Text style={globalStyles.forgotTitle}>
                        {t("auth", "forgotTitle")}
                    </Text>

                    <Text style={globalStyles.forgotSubtitle}>
                        {t("auth", "forgotSubtitle")}
                    </Text>
                </View>

                <Text style={globalStyles.label}>{t("auth", "emailLabel")}</Text>

                <TextInput
                    style={globalStyles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder=""
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Pressable
                    style={globalStyles.forgotPrimaryButton}
                    onPress={() => { }}
                >
                    <Text style={globalStyles.forgotPrimaryButtonText}>
                        {t("auth", "forgotSendLink")}
                    </Text>
                </Pressable>

                <Pressable
                    style={globalStyles.forgotLinkRow}
                    onPress={() => router.replace("/login")}
                >
                    <Text style={globalStyles.linkMuted}>
                        {t("auth", "forgotHaveAccount")}
                    </Text>
                    <Text style={globalStyles.linkStrong}>{t("auth", "signin")}</Text>
                </Pressable>

                <Pressable
                    style={globalStyles.forgotLinkRow}
                    onPress={() => router.replace("/signup")}
                >
                    <Text style={globalStyles.linkMuted}>
                        {t("auth", "forgotNoAccount")}
                    </Text>
                    <Text style={globalStyles.linkStrong}>
                        {t("auth", "signUp")}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}
