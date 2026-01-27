import { router } from "expo-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { t } from "../../../i18n";
import { globalStyles } from "../../../styles/theme";
import { colors } from "../../../styles/theme/colors";

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();

  const [email] = useState("theomcortez@gmail.com");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <View style={globalStyles.screenWithBottomBar}>
      <View
        style={[
          globalStyles.topHeader,
          globalStyles.topHeaderWithBack,
          { paddingTop: Math.max(insets.top, 10) },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={globalStyles.topHeaderBackBtn}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>

        <Text style={globalStyles.topHeaderTitlePassword}>
          {t("changePassword", "changePasswordTitle")}
        </Text>

        <View style={globalStyles.topHeaderRightSpacer} />
      </View>

      <ScrollView
        style={globalStyles.settingsScroll}
        contentContainerStyle={[
          globalStyles.changePasswordContent,
          { paddingBottom: 78 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={globalStyles.changePasswordInfoBox}>
          <Text style={globalStyles.changePasswordInfoText}>
            {t("changePassword", "changePasswordInfo")}
          </Text>
          <Text style={globalStyles.changePasswordInfoEmail}>{email}</Text>
        </View>

        <View style={globalStyles.changePasswordCard}>
          <Text style={globalStyles.changePasswordLabel}>
            {t("changePassword", "currentPasswordLabel")} *
          </Text>

          <View style={globalStyles.changePasswordInputWrap}>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              style={globalStyles.changePasswordInput}
              secureTextEntry={!showCurrent}
              placeholder=""
            />
            <Pressable
              hitSlop={12}
              style={globalStyles.changePasswordEye}
              onPress={() => setShowCurrent((v) => !v)}
            >
              {showCurrent ? (
                <Eye size={18} color={colors.textSecondary} />
              ) : (
                <EyeOff size={18} color={colors.textSecondary} />
              )}
            </Pressable>
          </View>

          <Text style={[globalStyles.changePasswordLabel, { marginTop: 14 }]}>
            {t("changePassword", "newPasswordLabel")} *
          </Text>

          <View style={globalStyles.changePasswordInputWrap}>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              style={globalStyles.changePasswordInput}
              secureTextEntry={!showNew}
              placeholder=""
            />
            <Pressable
              hitSlop={12}
              style={globalStyles.changePasswordEye}
              onPress={() => setShowNew((v) => !v)}
            >
              {showNew ? (
                <Eye size={18} color={colors.textSecondary} />
              ) : (
                <EyeOff size={18} color={colors.textSecondary} />
              )}
            </Pressable>
          </View>

          <Text style={globalStyles.changePasswordHint}>
            {t("changePassword", "passwordMinHint")}
          </Text>

          <Text style={[globalStyles.changePasswordLabel, { marginTop: 14 }]}>
            {t("changePassword", "confirmNewPasswordLabel")} *
          </Text>

          <View style={globalStyles.changePasswordInputWrap}>
            <TextInput
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              style={globalStyles.changePasswordInput}
              secureTextEntry={!showConfirm}
              placeholder=""
            />
            <Pressable
              hitSlop={12}
              style={globalStyles.changePasswordEye}
              onPress={() => setShowConfirm((v) => !v)}
            >
              {showConfirm ? (
                <Eye size={18} color={colors.textSecondary} />
              ) : (
                <EyeOff size={18} color={colors.textSecondary} />
              )}
            </Pressable>
          </View>

          <Pressable
            style={globalStyles.changePasswordButton}
            onPress={() => {
              console.log("Atualizar senha");
              router.back();
            }}
          >
            <Text style={globalStyles.changePasswordButtonText}>
              {t("changePassword", "updatePasswordButton")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
