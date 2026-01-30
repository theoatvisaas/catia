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
    paddingHorizontal: spacing.md,
    paddingBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  topHeaderTitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: "500",
    fontSize: 14,
  },

  settingsScroll: {
    flex: 1,
  },

  settingsContent: {
    paddingHorizontal: spacing.md,
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
    fontWeight: "400",
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

  // =========================
  // RECORD
  // =========================
  recordScroll: {
    flex: 1,
    backgroundColor: colors.modalBackground,
  },

  recordContent: {
    paddingHorizontal: spacing.md,
    paddingTop: 18,
    paddingBottom: 18,
    gap: 16,
  },

  recordCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,          // ✅ token global
    borderWidth: 1,
    borderColor: colors.border,

    paddingHorizontal: spacing.md + 2, // 18 visualmente
    paddingVertical: 22,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },

  recordCardTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 10,
  },

  recordCardText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  recordCardHint: {
    ...typography.body,
    color: colors.textTertiary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },

  recordCTA: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: "center",
    marginTop: 18,
  },

  recordCTAText: {
    ...typography.body,
    color: colors.onPrimary,
    fontWeight: "800",
    fontSize: 12,
  },

  // =========================
  // NEW RECORD (mais parecido com o print)
  // =========================
  newRecordScroll: {
    flex: 1,
    backgroundColor: colors.modalBackground,
  },

  newRecordContent: {
    paddingHorizontal: spacing.md,
    paddingTop: 14,
    paddingBottom: 18,
    gap: 14,
  },

  newRecordCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,

    paddingHorizontal: spacing.md,
    paddingVertical: 16,

    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },

  newRecordCardTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 12,
  },

  newRecordFieldLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },

  newRecordInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    ...typography.body,
    color: colors.textPrimary,

    // deixa o input com altura mais "reta" igual print
    height: 40,
  },

  newRecordSegmentRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 28,
    marginBottom: 28,
  },

  newRecordSegment: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingVertical: 7,
    paddingHorizontal: 14,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },

  newRecordSegmentActive: {
    borderColor: colors.primary,
  },

  newRecordSegmentText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },

  newRecordSegmentTextActive: {
    color: colors.primary,
    fontWeight: "800",
  },

  // pill do "Gravar" mais estreito e com ícone mais à esquerda
  newRecordMicButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 44,
    paddingHorizontal: 18,
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "center",
    width: 190, // 🔑 deixa igual print (menos largo)
  },

  newRecordMicIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  newRecordMicText: {
    ...typography.body,
    color: colors.onPrimary,
    fontWeight: "400",
    fontSize: 14,
    flex: 1,
    textAlign: "center", // 🔑 centraliza o texto enquanto ícone fica à esquerda
    marginRight: 28,     // 🔑 compensa largura do ícone p/ ficar central “visual”
  },

  // box do aviso mais "azulado" como no print
  newRecordInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: colors.modalInfoBackground,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  newRecordInfoIcon: {
    marginTop: 2,
  },

  newRecordInfoText: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },

  newRecordInfoStrong: {
    color: colors.textPrimary,
    fontWeight: "800",
  },

  newRecordGuideTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 10,
  },

  newRecordGuideText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  newRecordBulletList: {
    marginTop: 14,
    gap: 10,
  },

  newRecordBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  newRecordBulletDot: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 18,
    marginTop: -1,
  },

  newRecordBulletText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },

  newRecordBulletStrong: {
    color: colors.textPrimary,
    fontWeight: "800",
  },

  // =========================
  // VOICE ACTION (overlay do gravador)
  // =========================
  voiceActionOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
    elevation: 999,
    justifyContent: "flex-end",
  },

  voiceActionBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  voiceActionContainer: {
    backgroundColor: colors.warningRecord,
    borderRadius: radius.md,
    paddingVertical: 30,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
    height: 180,
  },

  voiceActionBars: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },

  voiceActionBar: {
    width: 10,
    height: 20,
    borderRadius: 999,
    backgroundColor: colors.warning ?? "#F5B942",
    opacity: 0.9,
  },

  voiceActionBarTall: {
    width: 10,
    height: 28,
    borderRadius: 999,
    backgroundColor: colors.warning ?? "#F5B942",
    opacity: 0.95,
  },

  voiceActionBarShort: {
    width: 10,
    height: 16,
    borderRadius: 999,
    backgroundColor: colors.warning ?? "#F5B942",
    opacity: 0.85,
  },

  voiceActionButton: {
    width: 230,
    height: 48,
    borderRadius: 999,
    backgroundColor: colors.warningSurface, // fallback
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  voiceActionButtonPressed: {
    opacity: 0.9,
  },

  voiceActionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  voiceActionButtonText: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },

  voiceActionTime: {
    ...typography.body,
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 12,
  },

  // =========================
  // STOP ACTION (modal de pós-gravação)
  // =========================
  stopActionOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  stopActionBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  stopActionSheet: {
    backgroundColor: colors.modalBackground, // ou colors.surfaceBack
    borderTopLeftRadius: radius.lg ?? radius.md,
    borderTopRightRadius: radius.lg ?? radius.md,
    paddingHorizontal: spacing.lg,
    paddingTop: 18,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: colors.border,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -10 },
    elevation: 14,
    alignItems: "center",
  },

  stopActionButtonPressed: {
    opacity: 0.92,
  },

  // Primary: Terminar
  stopActionPrimaryButton: {
    height: 52,
    width: "50%",
    borderRadius: 999,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  stopActionPrimaryIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  stopActionPrimaryText: {
    ...typography.body,
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: "800",
  },

  // Secondary: Continuar (outline)
  stopActionSecondaryButton: {
    height: 52,
    width: "50%",
    borderRadius: 999,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    marginTop: 12,
  },

  stopActionSecondaryIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(124,58,237,0.12)", // roxo suave
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  stopActionSecondaryText: {
    ...typography.body,
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800",
  },

  // Discard row
  stopActionDiscardRow: {
    marginTop: 16,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },

  stopActionDiscardPressed: {
    backgroundColor: "rgba(0,0,0,0.04)",
  },

  stopActionDiscardText: {
    ...typography.body,
    color: colors.textTertiary,
    fontSize: 14,
    fontWeight: "600",
  },

  // =========================
  // UPLOAD RECORD (tela full)
  // =========================
  uploadRecordOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    zIndex: 1000,
    elevation: 1000,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 50,
  },

  uploadRecordCard: {
    width: "88%",
    minHeight: 160,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 30,
    paddingHorizontal: spacing.xl ?? spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,

    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },

  uploadRecordIcon: {
    color: colors.primary,
    marginBottom: 14,
  },

  uploadRecordTitle: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 8,
  },

  uploadRecordSubtitle: {
    ...typography.body,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
    maxWidth: 240, // 🔑 quebra igual no print
  },

  // =========================
  // HISTORY LOADING
  // =========================

  loadingScreen: {
    flex: 1,
    backgroundColor: colors.modalBackground,
  },

  historyLoadingHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  historyLoadingBack: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  historyLoadingHeaderTitle: {
    ...typography.body,
    flex: 1,
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },

  historyLoadingHeaderRightSpace: {
    width: 40,
    height: 40,
  },

  historyLoadingContent: {
    flex: 1,
    backgroundColor: colors.modalBackground,
    paddingHorizontal: spacing.md,
    paddingTop: 14,
  },

  historyLoadingMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  historyLoadingMetaDate: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },

  historyLoadingPatientTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },

  historyLoadingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: 22,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },

  historyLoadingIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  historyLoadingTitle: {
    ...typography.body,
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 14,
  },

  historyLoadingProgressTrack: {
    width: "100%",
    height: 3,
    borderRadius: 999,
    backgroundColor: "rgba(124,58,237,0.18)",
    overflow: "hidden",
    marginBottom: 14,
  },

  historyLoadingProgressFill: {
    height: "100%",
    width: "18%",
    borderRadius: 999,
    backgroundColor: colors.primary,
  },

  historyLoadingStepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },

  historyLoadingStepText: {
    ...typography.body,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "500",
  },

  historyLoadingHint: {
    ...typography.body,
    color: colors.textTertiary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },

  historyLoadingFooter: {
    ...typography.body,
    marginTop: 16,
    color: colors.textTertiary,
    fontSize: 12,
    textAlign: "center",
  },

  historyLoadingActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },

  historyLoadingAdvancedButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
    maxWidth: 138
  },


  historyLoadingAdvancedText: {
    ...typography.body,
    fontSize: 12,
    fontWeight: "600",
    color: colors.primaryWhite,
  },

  historyLoadingMoreButton: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  historyLoadingMoreText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  historyReadyWrap: {
    gap: 16,
  },

  historyReadyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: 18,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },

  historyReadyCardTitle: {
    ...typography.body,
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },

  historyReadyCardBody: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },

  historyReadyCardBodyMuted: {
    color: colors.textTertiary,
    fontStyle: "italic",
  },

  historyReadyActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },

  historyReadyActionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
    marginTop: 12,
  },


  historyReadyActionButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: colors.surface,
  },


  historyReadyActionText: {
    ...typography.body,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  historyReadyActionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },


  // =========================
  // CONTEXT MENU (modalzinho)
  // =========================
  contextMenuBackdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },

  contextMenuCard: {
    position: "absolute",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,

    elevation: 8,

    paddingVertical: 6,
    overflow: "hidden",
  },

  contextMenuRow: {
    height: 42,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },

  contextMenuRowPressed: {
    backgroundColor: colors.surfaceMuted,
  },

  contextMenuRowDisabled: {
    opacity: 0.6,
  },

  contextMenuRowContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  contextMenuIconSlot: {
    width: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  contextMenuLabel: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "500",
    color: colors.textTertiary,
  },

  // =========================
  // ADVANCED ACTIONS MODAL (bottom sheet) - 1:1 COM O PRINT
  // =========================
  advancedActionsBackdrop: {
    flex: 1,
    backgroundColor: "rgba(139, 108, 246, 0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  advancedActionsSheet: {
    width: "96%",
    marginBottom: spacing.md,

    backgroundColor: colors.primaryWhite,
    borderRadius: radius.lg,
    overflow: "hidden",

    elevation: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },


  advancedActionsHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  advancedActionsTitle: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  advancedActionsCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  advancedActionsCloseBtnPressed: {
    backgroundColor: colors.surfaceMuted,
  },

  advancedActionsDivider: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.9,
  },

  advancedActionsList: {
    paddingVertical: 0,
  },

  advancedActionsItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primaryWhite,
  },

  advancedActionsItemPressed: {
    backgroundColor: colors.surfaceMuted,
  },

  advancedActionsItemLeft: {
    flex: 1,
    paddingRight: spacing.md,
  },

  advancedActionsItemTitle: {
    ...typography.body,
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: 3,
  },

  advancedActionsItemSubtitle: {
    ...typography.body,
    fontSize: 12,
    color: colors.textTertiary,
    lineHeight: 16,
  },

  advancedActionsChevron: {
    width: 24,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  advancedActionsBottomSafe: {
    height: 8,
  },

  // styles/theme.ts (adicione esta SESSÃO dentro do globalStyles)
  historyScreen: {
    flex: 1,
    backgroundColor: colors.modalBackground,
  },

  historyHeader: {
    paddingHorizontal: spacing.md,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  historyHeaderTitle: {
    ...typography.body,
    color: colors.textTertiary,
    fontSize: 14,
    fontWeight: "500",
  },

  historyScroll: {
    flex: 1,
  },

  historyDate: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  historyItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: 18,
  },

  historyItemPressed: {
    backgroundColor: colors.surfaceMuted,
  },

  historyItemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 6,
  },

  historyItemLeftTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },

  historyItemTitle: {
    ...typography.body,
    color: colors.primaryBlack,
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
  },

  historyBadge: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  historyBadgeText: {
    ...typography.body,
    color: colors.surfaceSub,
    fontSize: 10,
    fontWeight: "600",
  },

  historyItemTime: {
    ...typography.body,
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: "600",
  },

  historyItemSubtitle: {
    ...typography.body,
    color: colors.textTertiary,
    fontSize: 12,
    lineHeight: 18,
  },

  historyDivider: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.9,
  },

  historyContent: {
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    paddingBottom: 18,
    gap: 12,
  },

  historyGroupCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    shadowColor: colors.modaShadow,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
    marginTop: 8
  },

  historyGroupTopStrip: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: 15,
  },

  historyGroupTopStripText: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },

  // =========================
  //EditPacientModal
  // =========================

  editPatientBackdrop: {
    flex: 1,
    backgroundColor: "rgba(139, 108, 246, 0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  editPatientBackdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },

  editPatientSheet: {
    width: "92%",
    backgroundColor: colors.primaryWhite,
    borderRadius: radius.lg,
    overflow: "hidden",
    elevation: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },

  editPatientHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  editPatientTitle: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  editPatientCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  editPatientCloseBtnPressed: {
    backgroundColor: colors.surfaceMuted,
  },

  editPatientCloseIcon: {
    ...typography.body,
    fontSize: 18,
    fontWeight: "700",
    color: colors.textSecondary,
    lineHeight: 18,
  },

  editPatientDivider: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.9,
  },

  editPatientBody: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },

  editPatientLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 12,
    marginBottom: 6,
    marginTop: 10,
    opacity: 0.9,
  },

  editPatientInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    ...typography.body,
    color: colors.textPrimary,
  },

  editPatientPlaceholder: {
    color: colors.textDisabled,
  },

  editPatientFooter: {
    marginTop: 22,
    alignItems: "flex-end",
  },

  editPatientSaveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
  },

  editPatientSaveButtonPressed: {
    opacity: 0.9,
  },

  editPatientSaveText: {
    ...typography.body,
    color: colors.onPrimary,
    fontWeight: "800",
    fontSize: 12,
  },

  // =========================
  // LISTEN RECORD
  // =========================

  transcriptionScreen: {
    flex: 1,
    backgroundColor: colors.modalBackground,
  },

  transcriptionHeader: {
    paddingHorizontal: spacing.md,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  transcriptionHeaderTitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: "500",
    fontSize: 14,
  },

  transcriptionScroll: {
    flex: 1,
  },

  transcriptionCard: {
    marginHorizontal: spacing.md,
    marginTop: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,

    paddingHorizontal: spacing.md,
    paddingVertical: 20,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },


  transcriptionMetaLabel: {
    ...typography.body,
    color: colors.textTertiary,
    fontSize: 12,
    lineHeight: 16,
  },

  transcriptionMetaTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "400",
    marginTop: 4,
  },

  transcriptionDivider: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.9,
    marginTop: 14,
    marginBottom: 10,
  },

  transcriptionRow: {
    paddingTop: 10,
  },

  transcriptionRowLast: {
    paddingTop: 10,
    paddingBottom: 2,
  },

  transcriptionLabel: {
    ...typography.body,
    color: colors.textTertiary,
    fontSize: 12,
    marginBottom: 4,
  },

  transcriptionValueStrong: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "400",
  },

  transcriptionSectionTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "400",
    fontSize: 13,
    marginBottom: 14,
  },

  transcriptionListenText: {
    ...typography.body,
    color: colors.textTertiary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: spacing.md,
    marginBottom: 28,
  },

  transcriptionPlayerBlock: {
    marginTop: 14,
    marginBottom: 10,
  },

  transcriptionPlayerTime: {
    ...typography.body,
    color: colors.textTertiary,
    fontSize: 11,
    marginBottom: 10,
  },

  transcriptionPlayerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  transcriptionPlayerButton: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  transcriptionPlayerButtonPressed: {
    opacity: 0.92,
  },

  transcriptionSliderTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    position: "relative",
    overflow: "visible",
  },

  transcriptionSliderFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary,
  },

  transcriptionSliderThumb: {
    position: "absolute",
    top: -4,
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: colors.primary,
    marginLeft: -7,
  },

  // =========================
  // EDIT TRANSCRIPTION (modal editor) - réplica do print
  // =========================
  editTranscriptionBackdrop: {
    flex: 1,
    backgroundColor: "rgba(139, 108, 246, 0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  editTranscriptionBackdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },

  editTranscriptionSheet: {
    width: "92%",
    maxHeight: "86%",
    backgroundColor: colors.primaryWhite,
    borderRadius: radius.lg,
    overflow: "hidden",
    elevation: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },

  editTranscriptionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  editTranscriptionTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },

  editTranscriptionCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  editTranscriptionCloseBtnPressed: {
    backgroundColor: colors.surfaceMuted,
  },

  editTranscriptionCloseIcon: {
    ...typography.body,
    fontSize: 18,
    fontWeight: "700",
    color: colors.textSecondary,
    lineHeight: 18,
  },

  editTranscriptionDivider: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.9,
  },

  editTranscriptionEditorCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },

  editTranscriptionToolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },

  editTranscriptionToolBtn: {
    minWidth: 26,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  editTranscriptionToolBtnActive: {
    backgroundColor: colors.surfaceMuted,
  },

  editTranscriptionToolBtnPressed: {
    opacity: 0.9,
  },

  editTranscriptionToolText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },

  editTranscriptionToolTextActive: {
    color: colors.primary,
  },

  editTranscriptionEditorDivider: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.9,
  },

  editTranscriptionEditorScroll: {
    flexGrow: 0,
    flexShrink: 1,
    maxHeight: undefined as any,
  },

  editTranscriptionEditorContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },

  editTranscriptionInput: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 12,
    lineHeight: 18,
    minHeight: 260,
  },

  editTranscriptionFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: 14,
    paddingBottom: spacing.lg,
    alignItems: "flex-end",
  },

  editTranscriptionSaveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radius.sm,
  },

  editTranscriptionSaveButtonDisabled: {
    opacity: 0.55,
  },

  editTranscriptionSaveButtonPressed: {
    opacity: 0.92,
  },

  editTranscriptionSaveText: {
    ...typography.body,
    color: colors.onPrimary,
    fontWeight: "800",
    fontSize: 12,
  },

  // =========================
  // EXAMPLE SCREEN (Transcrição - exemplo do print)
  // =========================
  exampleScreen: {
    flex: 1,
    backgroundColor: colors.modalBackground,
  },

  exampleHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.primaryWhite, // header continua branco
    paddingHorizontal: spacing.md,
    paddingBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  exampleHeaderBack: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  exampleHeaderTitle: {
    ...typography.body,
    flex: 1,
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },

  exampleHeaderRightSpace: {
    width: 40,
    height: 40,
  },

  exampleScroll: {
    flex: 1,
  },

  exampleContent: {
    paddingHorizontal: spacing.md,
    paddingTop: 40,
  },

  examplePatientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },

  examplePatientName: {
    ...typography.body,
    color: colors.primaryBlack,
    fontSize: 20,
    fontWeight: "700",
  },

  examplePatientBadge: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  examplePatientBadgeText: {
    ...typography.body,
    color: colors.textsurfaceSub,
    fontSize: 12,
    fontWeight: "400",
  },

  // Audio card (roxo grande)
  exampleAudioCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 10
  },

  exampleAudioCardPressed: {
    opacity: 0.92,
  },

  exampleAudioLeft: {
    width: 46,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  exampleAudioPlayCircle: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: colors.primaryWhite,
    alignItems: "center",
    justifyContent: "center",
  },

  exampleAudioBody: {
    flex: 1,
    minWidth: 0,
    top: 8
  },

  exampleAudioTitle: {
    ...typography.body,
    color: colors.primaryWhite,
    fontSize: 13,
    fontWeight: "600",
  },

  exampleAudioSubtitle: {
    ...typography.body,
    color: colors.primaryWhite,
    opacity: 0.85,
    fontSize: 11,
    marginTop: 2,
  },

  exampleAudioDotRow: {
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  exampleAudioDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.primaryWhite,
    opacity: 0.9,
  },

  exampleIntroText: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 2,
    marginBottom: 12,
    alignSelf: "center",
    maxWidth: 380,
  },

  exampleList: {
    gap: 26,
    marginBottom: 22,
    paddingVertical: 20,
  },

  exampleListRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  exampleListText: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "300",
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },

  // Section header + badge “Em 80 segundos!”
  exampleSectionHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  exampleSectionTitle: {
    ...typography.body,
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
  },

  exampleSectionBadgeWrap: {
    position: "absolute",
    right: -6,  
    top: -10,   
    alignItems: "flex-end",
    justifyContent: "center",
  },

  exampleSectionBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    transform: [{ rotate: "-12deg" }],
  },

  exampleSectionBadgeText: {
    ...typography.body,
    color: colors.primaryWhite,
    fontSize: 10,
    fontWeight: "700",
  },

  exampleSectionBadgeSpark1: {
    position: "absolute",
    right: 2,
    top: -10,
    width: 10,
    height: 2,
    borderRadius: 999,
    backgroundColor: colors.warning,
    transform: [{ rotate: "20deg" }],
  },

  exampleSectionBadgeSpark2: {
    position: "absolute",
    right: -6,
    top: -2,
    width: 10,
    height: 2,
    borderRadius: 999,
    backgroundColor: colors.warning,
    transform: [{ rotate: "65deg" }],
  },

  exampleSectionBadgeSpark3: {
    position: "absolute",
    right: 6,
    top: -4,
    width: 8,
    height: 2,
    borderRadius: 999,
    backgroundColor: colors.warning,
    transform: [{ rotate: "-20deg" }],
  },

  exampleSectionBody: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 18,
  },

  exampleSectionCard: {
    backgroundColor: colors.primaryWhite,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    overflow: "visible",
  },

  // =========================
// FORGOT PASSWORD
// =========================
forgotHeader: {
  alignItems: "center",
  marginBottom: 18,
},

forgotLogoWrap: {
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "center",
  marginBottom: 14,
},

forgotLogoBar: {
  borderRadius: 999,
  opacity: 0.9,
},

forgotTitle: {
  ...typography.body,
  color: colors.textPrimary,
  fontWeight: "800",
  fontSize: 22,
  lineHeight: 26,
  textAlign: "center",
  marginBottom: 8,
},

forgotSubtitle: {
  ...typography.body,
  color: colors.textSecondary,
  fontSize: 12,
  lineHeight: 16,
  textAlign: "center",
  paddingHorizontal: spacing.lg,
},

forgotPrimaryButton: {
  backgroundColor: colors.primary,
  paddingVertical: 12,
  borderRadius: 12,
  alignItems: "center",
  marginTop: 10,
},

forgotPrimaryButtonText: {
  ...typography.body,
  color: colors.onPrimary,
  fontWeight: "800",
  fontSize: 12,
},

forgotLinkRow: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 14,
},


});
