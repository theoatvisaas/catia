import "react-native-url-polyfill/auto";

import { AuthProvider } from "@/providers/AuthProvider";
import { RecorderProvider } from "@/providers/RecordProvider";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE ?? "";

  return (
    <SafeAreaProvider>
      <StripeProvider
        publishableKey={publishableKey}
        merchantIdentifier="merchant.com.yourcompany"
      >
        <AuthProvider>
          <RecorderProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </RecorderProvider>
        </AuthProvider>
      </StripeProvider>
    </SafeAreaProvider>
  );
}
