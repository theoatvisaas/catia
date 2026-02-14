import { ts } from "@/lib/logger";

/**
 * Notification Service — local notifications for recording alerts.
 *
 * Uses expo-notifications for system-level notifications that work
 * even when the app is in the background. Essential for veterinarians
 * who are typically in other apps during consultations.
 *
 * Android channel "catia-alerts" is separate from expo-audio-studio's
 * foreground service channel — no conflicts.
 */

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

const TAG = "[NotificationService]";

// ── Initialization ─────────────────────────────────────────

/**
 * Configure notification handler + Android channel.
 * Call once on app startup (in _layout.tsx).
 */
export async function initNotifications(): Promise<void> {
    console.log(`${ts(TAG)} initNotifications()`);

    // Foreground handler: show notification even when app is in foreground
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });

    // Android: create dedicated channel for recording alerts
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("catia-alerts", {
            name: "Alertas de Gravacao",
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            sound: "default",
        });
        console.log(`${ts(TAG)} Android channel "catia-alerts" created`);
    }

    console.log(`${ts(TAG)} initNotifications() done`);
}

// ── Permission ─────────────────────────────────────────────

/**
 * Request notification permission from the OS.
 *
 * Returns true if granted, false otherwise.
 * On simulator (not physical device), returns true automatically.
 */
export async function requestNotificationPermission(): Promise<boolean> {
    console.log(`${ts(TAG)} requestNotificationPermission()`);

    // Simulators don't support push notifications — skip check
    if (!Device.isDevice) {
        console.log(`${ts(TAG)} Not a physical device — skipping permission (returning true)`);
        return true;
    }

    // Check existing status first
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log(`${ts(TAG)} Existing permission status: ${existingStatus}`);

    if (existingStatus === "granted") {
        return true;
    }

    // Ask for permission
    const { status } = await Notifications.requestPermissionsAsync();
    console.log(`${ts(TAG)} Requested permission, new status: ${status}`);

    return status === "granted";
}

// ── Send Notification ──────────────────────────────────────

type NotificationParams = {
    title: string;
    body: string;
    data?: Record<string, unknown>;
};

/**
 * Send an immediate local notification.
 */
export async function sendLocalNotification(params: NotificationParams): Promise<void> {
    console.log(`${ts(TAG)} sendLocalNotification() | title="${params.title}"`);

    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: params.title,
                body: params.body,
                data: params.data,
                sound: "default",
                ...(Platform.OS === "android" && { channelId: "catia-alerts" }),
            },
            trigger: null, // immediate
        });
        console.log(`${ts(TAG)} Notification sent: "${params.title}"`);
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`${ts(TAG)} Failed to send notification: ${msg}`);
    }
}

// ── Template Notifications ─────────────────────────────────

/** Notify: audio stream died (watchdog detected no audio) */
export async function notifyStreamDead(): Promise<void> {
    await sendLocalNotification({
        title: "Problema na Gravacao",
        body: "O microfone parou de responder. Abra o CatIA para verificar.",
        data: { type: "stream_dead" },
    });
}

/** Notify: disk space is low */
export async function notifyDiskFull(): Promise<void> {
    await sendLocalNotification({
        title: "Espaco em Disco Baixo",
        body: "A gravacao pode falhar. Abra o CatIA para verificar.",
        data: { type: "disk_full" },
    });
}

