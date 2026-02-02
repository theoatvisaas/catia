import { useAuthStore } from "@/stores/auth/useAuthStore";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const session = useAuthStore((s) => s.session);
  const hasHydrated = useAuthStore.persist.hasHydrated();

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (session?.access_token) {
    return <Redirect href="/record" />;
  }

  return <Redirect href="/login" />;
}
