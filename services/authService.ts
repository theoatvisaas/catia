import { ChangePasswordResponse, LoginResponse, MeResponse, SignUpResponse } from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./api";

async function saveSession(nextSession: any) {
    const raw = await AsyncStorage.getItem("auth-session");
    const parsed = raw ? JSON.parse(raw) : {};
    await AsyncStorage.setItem(
        "auth-session",
        JSON.stringify({
            ...parsed,
            state: {
                ...parsed.state,
                session: nextSession,
            },
        })
    );
}

async function refreshSession(refreshToken: string) {
    return apiRequest<any>({
        path: "/auth/refresh",
        method: "POST",
        body: { refresh_token: refreshToken },
    });
}


async function getValidAccessToken() {
    const raw = await AsyncStorage.getItem("auth-session");
    const parsed = raw ? JSON.parse(raw) : null;
    const session = parsed?.state?.session;

    if (!session?.access_token) return undefined;

    const now = Math.floor(Date.now() / 1000);

    if (session.expires_at && now < session.expires_at) {
        return session.access_token;
    }

    if (!session.refresh_token) return undefined;

    const refreshed = await refreshSession(session.refresh_token);

    if (!refreshed?.access_token) return undefined;
    await saveSession(refreshed);

    return refreshed?.access_token as string | undefined;
}


export const authService = {
    signUp: (input: { email: string; password: string }) =>
        apiRequest<SignUpResponse>({
            path: "/auth/signup",
            method: "POST",
            body: input,
        }),

    login: (input: { email: string; password: string }) =>
        apiRequest<LoginResponse>({
            path: "/auth/login",
            method: "POST",
            body: input,
        }),

    me: async () => {
        const token = await getValidAccessToken();
        return apiRequest<MeResponse>({
            path: "/auth/me",
            method: "GET",
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
    },

    changePassword: async (input: { currentPassword: string; newPassword: string }) => {
        const token = await getValidAccessToken();
        return apiRequest<ChangePasswordResponse>({
            path: "/auth/change-password",
            method: "PUT",
            body: input,
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
    },
};
