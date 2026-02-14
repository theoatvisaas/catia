import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "auth-session";


async function saveSession(nextSession: any) {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};

    await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            ...parsed,
            state: {
                ...parsed.state,
                session: nextSession,
            },
        })
    );
}


export async function refreshSession(refreshToken: string) {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;

    if (!baseUrl) {
        throw { status: 0, message: "Missing EXPO_PUBLIC_API_URL" };
    }

    const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const text = await res.text();
    let data: any = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
    }

    if (!res.ok) {
        throw {
            status: res.status,
            message: data?.message ?? `Refresh failed (${res.status})`,
            details: data,
        };
    }

    return data;
}


// Mutex: prevents concurrent refresh requests from using the same
// single-use refresh token, which would cause "refresh_token_already_used".
let refreshInFlight: Promise<string | undefined> | null = null;

export async function getValidAccessToken(): Promise<string | undefined> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const session = parsed?.state?.session;

    if (!session?.access_token) return undefined;

    const now = Math.floor(Date.now() / 1000);

    // Token still valid — return it directly
    if (session.expires_at && now < session.expires_at - 30) {
        return session.access_token as string;
    }

    // Token expired — need refresh
    if (!session.refresh_token) return undefined;

    // If a refresh is already in-flight, wait for it instead of
    // sending a duplicate request with the same refresh token.
    if (refreshInFlight) {
        return refreshInFlight;
    }

    refreshInFlight = (async () => {
        try {
            const refreshed = await refreshSession(session.refresh_token);
            if (!refreshed?.access_token) return undefined;
            await saveSession(refreshed);
            return refreshed.access_token as string;
        } finally {
            refreshInFlight = null;
        }
    })();

    return refreshInFlight;
}
