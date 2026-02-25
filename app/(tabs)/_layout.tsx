// app/(tabs)/_layout.tsx
import { Tabs, useSegments } from "expo-router";
import { Mic, ScrollText, Settings } from "lucide-react-native";
import React from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRecorder } from "@/providers/RecordProvider";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const { isRecording, isPaused } = useRecorder();

  const isNewRecord =
    segments.includes("record") && segments.includes("new-record");

  // Hide tab bar when recording sheets are visible:
  // - VoiceAction sheet: visible when isRecording && !isPaused (active recording)
  // - StopAction sheet: visible when isPaused (recording paused)
  // Show tab bar on the new-record screen when no sheet is open (before starting / after finishing)
  const hideTabBar = isNewRecord && (isRecording || isPaused);

  const activeColor = "#7C3AED";
  const inactiveColor = "#94A3B8";
  const barBg = "#F8FAFC";
  const border = "#E2E8F0";

  return (
    <SafeAreaView style={{flex: 1}} edges={["top"]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          tabBarLabelStyle: { fontSize: 12, marginTop: 6 },

          tabBarStyle: hideTabBar
            ? { display: "none" }
            : {
              backgroundColor: barBg,
              borderTopColor: border,
              borderTopWidth: 1,
              paddingTop: 10,
              paddingBottom: 12 + insets.bottom,
              height: 90 + insets.bottom,

            },
        }}
      >
        <Tabs.Screen
          name="history"
          options={{
            title: "Histórico",
            tabBarIcon: ({ color, size }) => (
              <ScrollText color={color} size={size ?? 24} />
            ),
          }}
        />

        <Tabs.Screen
          name="record"
          options={{
            title: "Gravar",
            tabBarIcon: ({ color, size }) => (
              <Mic color={color} size={size ?? 26} />
            ),
          }}
        />

        <Tabs.Screen
          name="settings/index"
          options={{
            title: "Ajustes",
            tabBarIcon: ({ color, size }) => (
              <Settings color={color} size={size ?? 24} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
