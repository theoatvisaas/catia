import "react-native-url-polyfill/auto";

import { AuthProvider } from "@/providers/AuthProvider";
import { ConsultationProvider } from "@/providers/ConsultationProvider";
import { RecorderProvider } from "@/providers/RecordProvider";
import { initNotifications } from "@/services/notifications/notificationService";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE ?? "";

  useEffect(() => {
    initNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <StripeProvider
        publishableKey={publishableKey}
        merchantIdentifier="merchant.com.yourcompany"
      >
        <AuthProvider>
          <ConsultationProvider>
            <RecorderProvider>
              <Stack screenOptions={{ headerShown: false }} />
            </RecorderProvider>
          </ConsultationProvider>
        </AuthProvider>
      </StripeProvider>
    </SafeAreaProvider>
  );
}
