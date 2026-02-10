import { RecorderProvider } from "@/providers/RecordProvider";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StripeProvider
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE!}
        merchantIdentifier="merchant.com.yourcompany"
      >
        <RecorderProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </RecorderProvider>
      </StripeProvider>
    </SafeAreaProvider>
  );
}
