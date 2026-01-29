import { t } from "@/i18n";
import { Alert } from "react-native";

export function confirmDeleteTranscription(opts?: {
  onConfirm?: () => void;
}) {
  Alert.alert(
    t("confirmDelete", "title"),
    t("confirmDelete", "message"),
    [
      { text: t("confirmDelete", "cancel"), style: "cancel" },
      {
        text: t("confirmDelete", "confirm"),
        style: "destructive",
        onPress: () => opts?.onConfirm?.(),
      },
    ],
    { cancelable: true }
  );
}
