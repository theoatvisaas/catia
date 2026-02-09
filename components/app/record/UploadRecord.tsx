import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";
import { CloudUpload } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

type UploadRecordProps = {
  visible: boolean;
  topOffset?: number;
};

export default function UploadRecord({ visible, topOffset = 0 }: UploadRecordProps) {
  if (!visible) return null;

  return (
    <View style={[globalStyles.uploadRecordOverlay, { top: topOffset }]}>
      <View style={globalStyles.uploadRecordCard}>
        <CloudUpload size={34} color={colors.primary} />

        <Text style={globalStyles.uploadRecordTitle}>Enviando Gravação</Text>

        <Text style={globalStyles.uploadRecordSubtitle}>
          Por favor, aguarde enquanto enviamos sua gravação.
        </Text>
      </View>
    </View>
  );
}
