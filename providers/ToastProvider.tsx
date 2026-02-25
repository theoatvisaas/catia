import { Check, TriangleAlert } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { colors } from "@/styles/theme/colors";
import { typography } from "@/styles/theme/typography";

// ── Types ────────────────────────────────────────────────

type ToastKind = "success" | "error";

type ToastEntry = {
    message: string;
    kind: ToastKind;
};

// ── Global emitter (callable from services / non-React code) ─

type Listener = (entry: ToastEntry) => void;

let _listener: Listener | null = null;

/**
 * Show a toast notification from anywhere in the app (React or non-React).
 *
 * If called before `ToastProvider` mounts, the toast is silently dropped.
 */
export function showToast(message: string, kind: ToastKind = "error"): void {
    _listener?.({ message, kind });
}

// ── Provider ─────────────────────────────────────────────

const AUTO_DISMISS_MS = 3500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [entry, setEntry] = useState<ToastEntry | null>(null);
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const show = useCallback((e: ToastEntry) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setEntry(e);
        setVisible(true);
        timerRef.current = setTimeout(() => setVisible(false), AUTO_DISMISS_MS);
    }, []);

    useEffect(() => {
        _listener = show;
        return () => {
            _listener = null;
        };
    }, [show]);

    return (
        <>
            {children}
            {entry && <Toast visible={visible} message={entry.message} kind={entry.kind} />}
        </>
    );
}

// ── Toast component (extracted from Settings ToastPopup) ─

function Toast({
    visible,
    message,
    kind,
}: {
    visible: boolean;
    message: string;
    kind: ToastKind;
}) {
    const [mounted, setMounted] = useState(visible);
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-12)).current;

    useEffect(() => {
        if (visible) {
            setMounted(true);
            opacity.setValue(0);
            translateY.setValue(-12);

            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 220,
                    useNativeDriver: true,
                }),
            ]).start();
            return;
        }

        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 160,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -12,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (finished) setMounted(false);
        });
    }, [visible, opacity, translateY]);

    if (!mounted) return null;

    const Icon = kind === "success" ? Check : TriangleAlert;
    const iconColor = kind === "success" ? colors.success : colors.textSecondary;

    return (
        <View
            pointerEvents="none"
            style={{
                position: "absolute",
                left: 16,
                right: 16,
                top: 50,
                alignItems: "center",
                zIndex: 9999,
            }}
        >
            <Animated.View
                style={{
                    width: "100%",
                    maxWidth: 520,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                    opacity,
                    transform: [{ translateY }],
                }}
            >
                <Icon size={16} color={iconColor} style={{ marginTop: 1 }} />

                <Text
                    style={{
                        ...typography.body,
                        color: kind === "error" ? colors.textSecondary : colors.textPrimary,
                        marginBottom: 0,
                        flex: 1,
                    }}
                >
                    {message}
                </Text>
            </Animated.View>
        </View>
    );
}
