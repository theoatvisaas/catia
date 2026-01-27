import { router } from "expo-router";
import { Check } from "lucide-react-native";
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { t } from "../../../i18n";
import { globalStyles } from "../../../styles/theme";
import { colors } from "../../../styles/theme/colors";

type PlanKey = "basic" | "advanced" | "pro";

type Plan = {
    key: PlanKey;
    title: string;
    price: string;
    features: string[];
    popular?: boolean;
};

export default function SubscribeScreen() {
    const insets = useSafeAreaInsets();

    const plans: Plan[] = useMemo(
        () => [
            {
                key: "basic",
                title: t("subscribe", "planBasicTitle"),
                price: t("subscribe", "planBasicPrice"),
                features: [
                    t("subscribe", "featureAdvancedModels"),
                    t("subscribe", "featureSupport"),
                ],
            },
            {
                key: "advanced",
                title: t("subscribe", "planAdvancedTitle"),
                price: t("subscribe", "planAdvancedPrice"),
                popular: true,
                features: [
                    t("subscribe", "featureAdvancedModels"),
                    t("subscribe", "featurePreferences"),
                    t("subscribe", "featureLearning"),
                    t("subscribe", "featureSupport"),
                ],
            },
            {
                key: "pro",
                title: t("subscribe", "planProTitle"),
                price: t("subscribe", "planProPrice"),
                features: [
                    t("subscribe", "featureAdvancedModels"),
                    t("subscribe", "featurePreferences"),
                    t("subscribe", "featureLearning"),
                    t("subscribe", "featureSupport"),
                ],
            },
        ],
        []
    );

    return (
        <View style={globalStyles.screenWithBottomBar}>
            <View
                style={[
                    globalStyles.subscribeHeader,
                    { paddingTop: Math.max(insets.top, 10) },
                ]}
            >
                <View style={globalStyles.subscribeBrandRow}>
                    <View style={globalStyles.subscribeBrandMark} />
                    <Text style={globalStyles.subscribeBrandText}>
                        {t("subscribe", "brand")}
                    </Text>
                </View>

                <Pressable
                    style={globalStyles.subscribeBackButton}
                    onPress={() => router.back()}
                >
                    <Text style={globalStyles.subscribeBackButtonText}>
                        {t("subscribe", "backToApp")}
                    </Text>
                </Pressable>
            </View>

            <ScrollView
                style={globalStyles.subscribeScroll}
                contentContainerStyle={[
                    globalStyles.subscribeContent,
                    { paddingBottom: 18 + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={globalStyles.subscribeTitle}>
                    {t("subscribe", "title")}
                </Text>

                {plans.map((plan) => (
                    <View key={plan.key} style={globalStyles.subscribeCard}>
                        {plan.popular ? (
                            <View style={globalStyles.subscribeRibbonWrap}>
                                <View style={globalStyles.subscribeRibbon}>
                                    <Text style={globalStyles.subscribeRibbonText} numberOfLines={1} ellipsizeMode="clip">
                                        {t("subscribe", "mostPopular")}
                                    </Text>
                                </View>
                            </View>
                        ) : null}

                        <Text style={globalStyles.subscribePlanTitle}>{plan.title}</Text>
                        <Text style={globalStyles.subscribePlanPrice}>{plan.price}</Text>

                        <View style={globalStyles.subscribeFeatureList}>
                            {plan.features.map((f, idx) => (
                                <View key={idx} style={globalStyles.subscribeFeatureRow}>
                                    <Check size={16} color={colors.success} />
                                    <Text style={globalStyles.subscribeFeatureText}>{f}</Text>
                                </View>
                            ))}
                        </View>

                        <Pressable
                            style={globalStyles.subscribeCTA}
                            onPress={() => {
                                console.log("Assinar plano:", plan.key);
                            }}
                        >
                            <Text style={globalStyles.subscribeCTAText}>
                                {t("subscribe", "cta")}
                            </Text>
                        </Pressable>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
