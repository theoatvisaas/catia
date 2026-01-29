import { t } from "@/i18n";
import { globalStyles } from "@/styles/theme";
import { colors } from "@/styles/theme/colors";
import { CheckCircle2, Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";



export default function PreparingReports() {
    return (
        <View style={globalStyles.historyLoadingCard}>
            <View style={globalStyles.historyLoadingIconWrap}>
                <Sparkles size={28} color={colors.primary} />
            </View>

            <Text style={globalStyles.historyLoadingTitle}>
                {t("historyLoading", "title")}
            </Text>

            <View style={globalStyles.historyLoadingProgressTrack}>
                <View style={globalStyles.historyLoadingProgressFill} />
            </View>

            <View style={globalStyles.historyLoadingStepRow}>
                <Text style={globalStyles.historyLoadingStepText}>
                    {t("historyLoading", "step")}
                </Text>
                <CheckCircle2 size={16} color={colors.success} />
            </View>

            <Text style={globalStyles.historyLoadingHint}>
                {t("historyLoading", "hint")}
            </Text>
        </View>
    );
}