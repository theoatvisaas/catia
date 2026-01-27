import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { globalStyles } from "../../styles/theme";
import { colors } from "../../styles/theme/colors";

function LogoMark() {
  // Ícone roxinho à esquerda do "AssistantDr"
  // (4 barrinhas arredondadas, alturas diferentes — bem parecido com o print)
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

          <Text style={globalStyles.subtitle}>Sign in</Text>
        </View>

        <Text style={globalStyles.label}>E-mail *</Text>
        <TextInput
          style={globalStyles.input}
          placeholder=""
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={globalStyles.label}>Password *</Text>
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
          onPress={() => router.replace("/dashboard")}
        >
          <Text style={globalStyles.buttonText}>Sign in</Text>
        </Pressable>

        <Pressable style={globalStyles.linkRow}
          onPress={() => router.replace("/signup")}>
          <Text style={globalStyles.linkMuted}>{"Don't have an account yet? "}</Text>
          <Text style={globalStyles.linkStrong}>Sign up</Text>
        </Pressable>

        <Pressable style={globalStyles.forgotWrap}>
          <Text style={globalStyles.linkStrong}>Forgot your password?</Text>
        </Pressable>
      </View>
    </View>
  );
}
