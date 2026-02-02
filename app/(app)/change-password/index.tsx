import { router } from "expo-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/stores/auth/useAuthStore";
import { t } from "../../../i18n";
import { globalStyles } from "../../../styles/theme";
import { colors } from "../../../styles/theme/colors";

type FieldErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
  form?: string;
};

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();

  const changePassword = useAuthStore((s) => s.changePassword);
  const loading = useAuthStore((s) => s.loading);
  const storeError = useAuthStore((s) => s.error);

  const [email] = useState("theomcortez@gmail.com");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const topErrorMessage = useMemo(
    () => fieldErrors.form ?? storeError ?? null,
    [fieldErrors.form, storeError]
  );

  function onChangeCurrentPassword(v: string) {
    setCurrentPassword(v);
    if (fieldErrors.currentPassword || fieldErrors.form) {
      setFieldErrors((prev) => ({ ...prev, currentPassword: undefined, form: undefined }));
    }
  }

  function onChangeNewPassword(v: string) {
    setNewPassword(v);
    if (fieldErrors.newPassword || fieldErrors.form) {
      setFieldErrors((prev) => ({ ...prev, newPassword: undefined, form: undefined }));
    }
  }

  function onChangeConfirmNewPassword(v: string) {
    setConfirmNewPassword(v);
    if (fieldErrors.confirmNewPassword || fieldErrors.form) {
      setFieldErrors((prev) => ({ ...prev, confirmNewPassword: undefined, form: undefined }));
    }
  }

  async function handleChangePassword() {
    const errors: FieldErrors = {};

    if (!currentPassword) errors.currentPassword = t("changePassword", "errorRequired");
    if (!newPassword) errors.newPassword = t("changePassword", "errorRequired");
    if (!confirmNewPassword) errors.confirmNewPassword = t("changePassword", "errorRequired");

    if (!errors.newPassword && newPassword && newPassword.length < 6) {
      errors.newPassword = t("changePassword", "errorPasswordMin");
    }

    if (!errors.confirmNewPassword && newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
      errors.confirmNewPassword = t("changePassword", "errorPasswordsDontMatch");
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    try {
      const response = await changePassword({ currentPassword, newPassword });
      if (response) router.back();
    } catch {

    }
  }

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
              onChangeText={onChangeCurrentPassword}
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

          {topErrorMessage ? (
            <Text style={[globalStyles.changePasswordHint, { color: colors.error, marginTop: 6 }]}>
              {topErrorMessage}
            </Text>
          ) : null}

          {fieldErrors.currentPassword ? (
            <Text style={[globalStyles.changePasswordHint, { color: colors.error, marginTop: 6 }]}>
              {fieldErrors.currentPassword}
            </Text>
          ) : null}

          <Text style={[globalStyles.changePasswordLabel, { marginTop: 14 }]}>
            {t("changePassword", "newPasswordLabel")} *
          </Text>

          <View style={globalStyles.changePasswordInputWrap}>
            <TextInput
              value={newPassword}
              onChangeText={onChangeNewPassword}
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

          {fieldErrors.newPassword ? (
            <Text style={[globalStyles.changePasswordHint, { color: colors.error, marginTop: 6 }]}>
              {fieldErrors.newPassword}
            </Text>
          ) : (
            <Text style={globalStyles.changePasswordHint}>
              {t("changePassword", "passwordMinHint")}
            </Text>
          )}

          <Text style={[globalStyles.changePasswordLabel, { marginTop: 14 }]}>
            {t("changePassword", "confirmNewPasswordLabel")} *
          </Text>

          <View style={globalStyles.changePasswordInputWrap}>
            <TextInput
              value={confirmNewPassword}
              onChangeText={onChangeConfirmNewPassword}
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

          {fieldErrors.confirmNewPassword ? (
            <Text style={[globalStyles.changePasswordHint, { color: colors.error, marginTop: 6 }]}>
              {fieldErrors.confirmNewPassword}
            </Text>
          ) : null}

          <Pressable
            style={[
              globalStyles.changePasswordButton,
              loading ? { opacity: 0.7 } : null,
            ]}
            onPress={handleChangePassword}
            disabled={loading}
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
