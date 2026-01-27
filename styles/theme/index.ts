// styles/theme.ts
import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { radius } from "./radius";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const theme = {
  colors,
  spacing,
  typography,
  radius,
};

export const globalStyles = StyleSheet.create({
  // =========================
  // LAYOUT
  // =========================
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
  },

  container: {
    width: "100%",
    alignSelf: "center",
  },

  // =========================
  // HEADER / BRAND (LOGIN)
  // =========================
  header: {
    alignItems: "center",
    marginBottom: 26,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  logoMark: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 3,
  },

  logoBar: {
    width: 4,
    borderRadius: 999,
    opacity: 0.9,
  },

  brandText: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: "center",
  },

  // =========================
  // TEXT
  // =========================
  subtitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 22,
    lineHeight: 26,
    textAlign: "center",
  },

  label: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: 8,
    fontSize: 12,
    opacity: 0.9,
  },

  helperText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 6,
  },

  // =========================
  // INPUTS
  // =========================
  input: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    backgroundColor: colors.surface,
    ...typography.body,
  },

  passwordWrap: {
    position: "relative",
  },

  passwordInput: {
    paddingRight: 44,
    marginBottom: 16,
  },

  passwordInputNoGap: {
    paddingRight: 44,
    marginBottom: 0,
  },

  eyeButton: {
    position: "absolute",
    right: 12,
    top: 12,
    height: 24,
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  // =========================
  // BUTTONS
  // =========================
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },

  buttonText: {
    ...typography.body,
    color: colors.onPrimary,
    fontWeight: "700",
  },

  // =========================
  // LINKS
  // =========================
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },

  linkMuted: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 12,
  },

  linkStrong: {
    ...typography.body,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },

  linkInline: {
    color: colors.primary,
    fontWeight: "700",
  },

  forgotWrap: {
    marginTop: 12,
    alignItems: "center",
  },

  // =========================
  // SIGNUP - HEADER / LOGO
  // =========================
  signupHeader: {
    alignItems: "center",
    marginBottom: 18,
  },

  signupTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 22,
    lineHeight: 26,
    marginTop: 10,
  },

  logoIconWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 6,
  },

  logoIconBar: {
    borderRadius: 999,
    opacity: 0.9,
  },

  // =========================
  // SIGNUP - SELECT
  // =========================
  select: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectValue: {
    ...typography.body,
    color: colors.textPrimary,
  },

  // =========================
  // SIGNUP - CHECKBOX
  // =========================
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },

  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  checkText: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 12,
  },

  // =========================
  // SIGNUP - FOOTER LINK
  // =========================
  bottomLinkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
});
