import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { t } from "../../i18n"; // ✅ ajuste se necessário
import { globalStyles } from "../../styles/theme";
import { colors } from "../../styles/theme/colors";

function LogoMark() {
  const bars = useMemo(
    () => [
      { h: 10, mt: 10 },
      { h: 18, mt: 2 },
      { h: 14, mt: 6 },
      { h: 8, mt: 12 },
    ],
    []
  );

  return (
    <View style={globalStyles.logoMark}>
      {bars.map((b, i) => (
        <View
          key={i}
          style={[
            globalStyles.logoBar,
            { height: b.h, marginTop: b.mt, backgroundColor: colors.primary },
          ]}
        />
      ))}
    </View>
  );
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={globalStyles.screen}>
      <View style={globalStyles.container}>
        <View style={globalStyles.header}>
          <View style={globalStyles.brandRow}>
            <LogoMark />
            <Text style={globalStyles.brandText}>AssistantDr</Text>
          </View>

          <Text style={globalStyles.subtitle}>{t("auth", "subtitle")}</Text>
        </View>

        <Text style={globalStyles.label}>
          {t("auth", "emailLabel")} *
        </Text>
        <TextInput
          style={globalStyles.input}
          placeholder=""
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={globalStyles.label}>
          {t("auth", "passwordLabel")} *
        </Text>
        <View style={globalStyles.passwordWrap}>
          <TextInput
            style={[globalStyles.input, globalStyles.passwordInput]}
            placeholder=""
            secureTextEntry={!showPassword}
          />

          <Pressable
            hitSlop={12}
            onPress={() => setShowPassword((v) => !v)}
            style={globalStyles.eyeButton}
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>

        <Pressable
          style={globalStyles.button}
          onPress={() => router.replace("/record")}
        >
          <Text style={globalStyles.buttonText}>
            {t("auth", "submitButton")}
          </Text>
        </Pressable>

        <Pressable
          style={globalStyles.linkRow}
          onPress={() => router.replace("/signup")}
        >
          <Text style={globalStyles.linkMuted}>{t("auth", "noAccount")}</Text>
          <Text style={globalStyles.linkStrong}>{t("auth", "signUp")}</Text>
        </Pressable>

        <Pressable style={globalStyles.forgotWrap}
          onPress={() => router.replace("/forgot-password")}
        >
          <Text style={globalStyles.linkStrong}>
            {t("auth", "forgotPassword")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
