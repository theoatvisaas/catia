import { router } from "expo-router";
import { Check } from "lucide-react-native";
import React, { useEffect } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePaymentStore } from "@/stores/billing/usePaymentStore";
import { usePlansStore } from "@/stores/billing/usePlansStore";
import { CreateCheckoutInput } from "@/types/payment";
import { useStripe } from "@stripe/stripe-react-native";
import { t } from "../../../i18n";
import { globalStyles } from "../../../styles/theme";
import { colors } from "../../../styles/theme/colors";

function formatMonthlyPrice(v: string) {
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
    const { createCheckout } = usePaymentStore();

    const { initPaymentSheet, presentPaymentSheet } = useStripe();


    useEffect(() => {
        console.log("hydrated:", hydrated);

        if (!hydrated) return;

        listPlans()
            .then(() => console.log("listPlans OK"))
            .catch((e) => console.log("❌ erro listPlans:", e?.message ?? e));
    }, [hydrated, listPlans]);

    useEffect(() => {
        console.log("plans:", plans);
    }, [plans]);


    async function handleSubmit(priceId: string) {
        try {
            const body: CreateCheckoutInput = { stripe_price_id: priceId };
            const res = await createCheckout(body);

            const secret = (res as any).paymentIntentClientSecret as string | undefined;


            if (!secret) {
                Alert.alert("Erro", "PaymentIntent não retornado pelo backend");
                return;
            }

            const isSetup = secret.startsWith("seti_");

            const { error: initError } = await initPaymentSheet({
                merchantDisplayName: "Catia",
                customerId: res.customerId,
                customerEphemeralKeySecret: res.ephemeralKeySecret,
                ...(isSetup ? { setupIntentClientSecret: secret} : {paymentIntentClientSecret: secret}),
                allowsDelayedPaymentMethods: false,
            });

            if (initError) {
                Alert.alert("Erro ao preparar pagamento", initError.message);
                return;
            }

            const { error: presentError } = await presentPaymentSheet();

            if (presentError) {
                Alert.alert("Pagamento não concluído", presentError.message);
                return;
            }

            Alert.alert("Assinatura ativa", "Pagamento concluído com sucesso.");
        } catch (e: any) {
            console.log("❌ createCheckout error:", e?.response?.data ?? e?.message ?? e);
            Alert.alert("Erro", "Falha ao iniciar assinatura.");
        }
    }


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

                {loading ? (
                    <View style={{ marginTop: 10, marginBottom: 12, alignItems: "center" }}>
                        <ActivityIndicator />
                    </View>
                ) : error ? (
                    <View style={{ marginTop: 10, marginBottom: 12 }}>
                        <Text style={globalStyles.settingsSectionSubtitle}>{error}</Text>

                        <Pressable
                            style={globalStyles.settingsPrimaryButton}
                            onPress={() => listPlans().catch(() => { })}
                        >
                            <Text style={globalStyles.settingsPrimaryButtonText}>
                                {t("common", "tryAgain")}
                            </Text>
                        </Pressable>
                    </View>
                ) : null}

                {(plans ?? []).map((plan) => {
                    const title = String(plan.title);
                    const price = `${formatMonthlyPrice(String(plan.monthly_amount))}/${t("subscribe", "monthSuffix")}`;
                    const features = (plan.advantages ?? []) as string[];
                    const popular = !!plan.isFeatured;
                    const stripePriceId = String(plan.stripe_price_id);

                    return (
                        <View key={String(plan.id)} style={globalStyles.subscribeCard}>
                            {popular ? (
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

                            <Text style={globalStyles.subscribePlanTitle}>{title}</Text>
                            <Text style={globalStyles.subscribePlanPrice}>{price}</Text>

                            <View style={globalStyles.subscribeFeatureList}>
                                {features.map((f, idx) => (
                                    <View key={idx} style={globalStyles.subscribeFeatureRow}>
                                        <Check size={16} color={colors.success} />
                                        <Text style={globalStyles.subscribeFeatureText}>{f}</Text>
                                    </View>
                                ))}
                            </View>

                            <Pressable
                                style={globalStyles.subscribeCTA}
                                onPress={() => handleSubmit(stripePriceId)}
                            >
                                <Text style={globalStyles.subscribeCTAText}>
                                    {t("subscribe", "cta")}
                                </Text>
                            </Pressable>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}
