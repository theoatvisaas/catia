import { router, usePathname } from "expo-router";
import { Mic, ScrollText, Settings } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { globalStyles } from "../../styles/theme";
import { colors } from "../../styles/theme/colors";

type TabKey = "historico" | "gravar" | "ajustes";

type TabItem = {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  route: string;
};

const TABS: TabItem[] = [
  { key: "historico", label: "Histórico", icon: ScrollText, route: "/history" },
  { key: "gravar", label: "Gravar", icon: Mic, route: "/record" },
  { key: "ajustes", label: "Ajustes", icon: Settings, route: "/settings" },
];

export default function BottomBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isActive = (route: string) =>
    pathname === route || pathname.startsWith(route + "/");


  return (
    <View
      style={[
        globalStyles.bottomBar,

        { paddingBottom: 12 + insets.bottom },
      ]}
    >
      {TABS.map((tab) => {
        const active = isActive(tab.route);
        const Icon = tab.icon;

        return (
          <Pressable
            key={tab.key}
            style={globalStyles.bottomBarItem}
            onPress={() => router.replace(tab.route)}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
          >
            <Icon
              size={25}
              color={active ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                globalStyles.bottomBarLabel,
                active && globalStyles.bottomBarLabelActive,
              ]}
            >
              {tab.label}
            </Text>

          </Pressable>
        );
      })}
    </View>
  );
}
