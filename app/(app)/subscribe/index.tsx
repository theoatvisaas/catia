import { router } from "expo-router";
import { Check } from "lucide-react-native";
import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePlansStore } from "@/stores/billing/usePlansStore";
import { t } from "../../../i18n";
import { globalStyles } from "../../../styles/theme";
import { colors } from "../../../styles/theme/colors";

type UiPlan = {
    id: string;
    title: string;
    price: string;
    features: string[];
    popular?: boolean;
};

function formatMonthlyPrice(v: string) {
    // backend manda decimal como string (ex: "29.90")
    const n = Number(v);
    if (!Number.isFinite(n)) return v;

    try {
        return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    } catch {
        return String(n);
    }
}

export default function SubscribeScreen() {
    const insets = useSafeAreaInsets();

    const { plans, loading, error, hydrated, listPlans } = usePlansStore();

    useEffect(() => {
        // se quiser sempre buscar mesmo com cache, remova o if
        if (!hydrated) return;

        listPlans().catch((e) => {
            console.log("❌ erro listPlans:", e?.message ?? e);
        });
    }, [hydrated]);

    const uiPlans: UiPlan[] = useMemo(() => {
        // Se não veio nada do backend ainda, mantém fallback com i18n (não quebra layout)
        if (!plans || plans.length === 0) {
            return [
                {
                    id: "basic",
                    title: t("subscribe", "planBasicTitle"),
                    price: t("subscribe", "planBasicPrice"),
                    features: [t("subscribe", "featureAdvancedModels"), t("subscribe", "featureSupport")],
                },
                {
                    id: "advanced",
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
                    id: "pro",
                    title: t("subscribe", "planProTitle"),
                    price: t("subscribe", "planProPrice"),
                    features: [
                        t("subscribe", "featureAdvancedModels"),
                        t("subscribe", "featurePreferences"),
                        t("subscribe", "featureLearning"),
                        t("subscribe", "featureSupport"),
                    ],
                },
            ];
        }

        return plans.map((p) => ({
            id: p.id,
            title: p.title,
            price: `${formatMonthlyPrice(p.monthly_amount)}/${t("subscribe", "monthSuffix") ?? "mês"}`,
            features: p.advantages ?? [],
            popular: !!p.isFeatured,
        }));
    }, [plans]);

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

                {/* loading/erro sem quebrar layout */}
                {loading ? (
                    <View style={{ marginTop: 10, marginBottom: 12, alignItems: "center" }}>
                        <ActivityIndicator />
                    </View>
                ) : error ? (
                    <View style={{ marginTop: 10, marginBottom: 12 }}>
                        <Text style={globalStyles.settingsSectionSubtitle}>
                            {error}
                        </Text>

                        <Pressable
                            style={globalStyles.settingsPrimaryButton}
                            onPress={() => listPlans().catch(() => { })}
                        >
                            <Text style={globalStyles.settingsPrimaryButtonText}>
                                {t("common", "tryAgain") ?? "Tentar novamente"}
                            </Text>
                        </Pressable>
                    </View>
                ) : null}

                {uiPlans.map((plan) => (
                    <View key={plan.id} style={globalStyles.subscribeCard}>
                        {plan.popular ? (
                            <View style={globalStyles.subscribeRibbonWrap}>
                                <View style={globalStyles.subscribeRibbon}>
                                    <Text
                                        style={globalStyles.subscribeRibbonText}
                                        numberOfLines={1}
                                        ellipsizeMode="clip"
                                    >
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
                                console.log("Assinar plano:", plan.id);
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
