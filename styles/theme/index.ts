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
    paddingHorizontal: spacing.md, // ✅ padrão global 16
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

  // =========================
  // LAYOUT - COM BOTTOM BAR
  // =========================
  screenWithBottomBar: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.md, // ✅ padrão global 16
    justifyContent: "center",
  },

  // =========================
  // BOTTOM BAR
  // =========================
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: spacing.md, // ✅ 16 (era 18)
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceBack,
  },

  bottomBarItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
    gap: 6,
  },

  bottomBarLabel: {
    ...typography.body,
    fontSize: 15,
    color: colors.textSecondary,
  },

  bottomBarLabelActive: {
    color: colors.primary,
    fontWeight: "700",
  },

  bottomBarDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.primary,
    marginTop: -2,
  },

  // =========================
  // SETTINGS
  // =========================
  topHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md, // ✅ padrão global 16
    paddingBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  topHeaderTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 14,
  },

  settingsScroll: {
    flex: 1,
  },

  settingsContent: {
    paddingHorizontal: spacing.md, // ✅ padrão global 16
    paddingTop: 18,
  },

  settingsBanner: {
    backgroundColor: colors.warning,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },

  settingsBannerText: {
    ...typography.body,
    color: "#2B2B2B",
    fontSize: 12,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },

  settingsBannerStrong: {
    fontWeight: "700",
  },

  settingsBannerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  settingsBannerIcon: {
    marginTop: 2,
    marginRight: 8,
  },

  settingsSection: {
    paddingTop: 6,
    paddingBottom: 16,
  },

  settingsSectionTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 8,
  },

  settingsSectionSubtitle: {
    ...typography.body,
    color: colors.textTertiary,
    fontSize: 12,
    marginBottom: 14,
    lineHeight: 16,
  },

  settingsDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 18,
  },

  settingsFieldLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 12,
    marginBottom: 6,
    marginTop: 12,
    opacity: 0.9,
  },

  settingsInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    ...typography.body,
    color: colors.textPrimary,
  },

  settingsSelectLike: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  settingsSelectText: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 13,
  },

  settingsActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
  },

  settingsPrimaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  settingsPrimaryButtonText: {
    ...typography.body,
    color: colors.onPrimary,
    fontWeight: "700",
    fontSize: 12,
  },

  settingsGhostButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  settingsGhostButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: 12,
  },

  settingsSaveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  settingsSaveButtonText: {
    ...typography.body,
    color: colors.onPrimary,
    fontWeight: "800",
    fontSize: 12,
  },

  // =========================
  // CHANGE PASSWORD
  // =========================
  changePasswordContent: {
    paddingHorizontal: spacing.md, // ✅ padrão global 16
    paddingTop: 18,
  },

  changePasswordInfoBox: {
    backgroundColor: "#EEF2F7",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  changePasswordInfoText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 6,
  },

  changePasswordInfoEmail: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 13,
  },

  changePasswordCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },

  changePasswordLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 12,
    marginBottom: 6,
    opacity: 0.9,
  },

  changePasswordInputWrap: {
    position: "relative",
  },

  changePasswordInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    paddingRight: 44,
    backgroundColor: colors.surface,
    ...typography.body,
    color: colors.textPrimary,
  },

  changePasswordEye: {
    position: "absolute",
    right: 12,
    top: 10,
    height: 24,
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  changePasswordHint: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 6,
  },

  changePasswordButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignSelf: "flex-end",
    marginTop: 16,
  },

  changePasswordButtonText: {
    ...typography.body,
    color: colors.onPrimary,
    fontWeight: "800",
    fontSize: 12,
  },

  topHeaderWithBack: {
    flexDirection: "row",
    alignItems: "center",
  },

  topHeaderBackBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  topHeaderTitlePassword: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 14,
    flex: 1,
    textAlign: "center",
  },

  topHeaderRightSpacer: {
    width: 40,
    height: 40,
  },

  // =========================
  // SUBSCRIBE
  // =========================
  subscribeHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  subscribeBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  subscribeBrandMark: {
    width: 18,
    height: 18,
    borderRadius: 6,
    backgroundColor: colors.primary,
    opacity: 0.9,
  },

  subscribeBrandText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "800",
    fontSize: 14,
  },

  subscribeBackButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  subscribeBackButtonText: {
    ...typography.body,
    color: colors.onPrimary,
    fontWeight: "700",
    fontSize: 12,
  },

  subscribeScroll: {
    flex: 1,
    backgroundColor: colors.modalBackground,
  },

  subscribeContent: {
    paddingHorizontal: spacing.md, // ✅ padrão global 16
    paddingTop: 20,
    paddingBottom: 18,
  },

  subscribeTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "800",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 14,
  },

  subscribeCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,

    paddingHorizontal: 18,
    paddingVertical: 22,

    marginBottom: 18,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },

  subscribePlanTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 10,
  },

  subscribePlanPrice: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 12,
  },

  subscribeFeatureList: {
    gap: 10,
    marginBottom: 22,
  },

  subscribeFeatureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  subscribeFeatureText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 12,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    lineHeight: 18,
  },

  subscribeCTA: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  subscribeCTAText: {
    ...typography.body,
    color: colors.onPrimary,
    fontWeight: "800",
    fontSize: 12,
  },

  subscribeRibbonWrap: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 210,
    height: 210,
    overflow: "hidden",
  },

  subscribeRibbon: {
    position: "absolute",
    right: -46,
    top: 22,
    backgroundColor: colors.warning,
    height: 18,
    width: 220,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "45deg" }],
    borderRadius: 8,
  },

  subscribeRibbonText: {
    ...typography.body,
    color: "#2B2B2B",
    fontWeight: "800",
    fontSize: 10,
    lineHeight: 10,
    includeFontPadding: false,
    textAlignVertical: "center",
  },

});
