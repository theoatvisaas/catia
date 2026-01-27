// app/(auth)/signup.tsx
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { t } from "../../i18n"; // ✅ ajuste se necessário
import { globalStyles } from "../../styles/theme";
import { colors } from "../../styles/theme/colors";

function LogoIcon() {
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
    <View style={globalStyles.logoIconWrap}>
      {bars.map((b, i) => (
        <View
          key={i}
          style={[
            globalStyles.logoIconBar,
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

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ como o app é PT, deixa em "Português" por padrão
  const [language, setLanguage] = useState("Português");

  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  return (
    <View style={globalStyles.screen}>
      <View style={globalStyles.container}>
        <View style={globalStyles.signupHeader}>
          <LogoIcon />
          <Text style={globalStyles.signupTitle}>{t("auth", "signupTitle")}</Text>
        </View>

        <Text style={globalStyles.label}>
          {t("auth", "emailLabel")} *
        </Text>
        <TextInput
          style={globalStyles.input}
          value={email}
          onChangeText={setEmail}
          placeholder=""
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={globalStyles.label}>
          {t("auth", "passwordLabel")} *
        </Text>
        <View style={globalStyles.passwordWrap}>
          <TextInput
            style={[globalStyles.input, globalStyles.passwordInputNoGap]}
            value={password}
            onChangeText={setPassword}
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

        <Text style={globalStyles.helperText}>{t("auth", "passwordHint")}</Text>

        <Text style={[globalStyles.label, { marginTop: 14 }]}>
          {t("auth", "languageLabel")} *
        </Text>

        <Pressable style={globalStyles.select}>
          <Text style={globalStyles.selectValue}>{language}</Text>
          <Feather name="chevron-down" size={18} color={colors.textSecondary} />
        </Pressable>

        <Text style={globalStyles.helperText}>{t("auth", "languageHelper")}</Text>

        <Pressable
          style={globalStyles.checkRow}
          onPress={() => setAgreePrivacy((v) => !v)}
        >
          <View
            style={[
              globalStyles.checkbox,
              agreePrivacy && globalStyles.checkboxOn,
            ]}
          >
            {agreePrivacy && (
              <Feather name="check" size={14} color={colors.onPrimary} />
            )}
          </View>

          <Text style={globalStyles.checkText}>
            {t("auth", "agreePrivacyPrefix")}
            <Text style={globalStyles.linkInline}>
              {t("auth", "privacyPolicy")}
            </Text>
          </Text>
        </Pressable>

        <Pressable
          style={globalStyles.checkRow}
          onPress={() => setAgreeTerms((v) => !v)}
        >
          <View
            style={[globalStyles.checkbox, agreeTerms && globalStyles.checkboxOn]}
          >
            {agreeTerms && (
              <Feather name="check" size={14} color={colors.onPrimary} />
            )}
          </View>

          <Text style={globalStyles.checkText}>
            {t("auth", "agreeTermsPrefix")}
            <Text style={globalStyles.linkInline}>
              {t("auth", "termsOfUse")}
            </Text>
          </Text>
        </Pressable>

        <Pressable
          style={[globalStyles.button, { marginTop: 18 }]}
          onPress={() => router.replace("/dashboard")}
        >
          <Text style={globalStyles.buttonText}>
            {t("auth", "signupButton")}
          </Text>
        </Pressable>

        <Pressable
          style={globalStyles.bottomLinkRow}
          onPress={() => router.replace("/login")}
        >
          <Text style={globalStyles.linkMuted}>{t("auth", "haveAccount")}</Text>
          <Text style={globalStyles.linkStrong}>{t("auth", "signin")}</Text>
        </Pressable>
      </View>
    </View>
  );
}
