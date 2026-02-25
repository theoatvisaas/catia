import { useAuthStore } from "@/stores/auth/useAuthStore";

const TAG = "[Token]";


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
    // Read from Zustand store (single source of truth, auto-persisted to AsyncStorage)
    const session = useAuthStore.getState().session;

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

            // Update Zustand store — persist middleware auto-saves to AsyncStorage.
            // This keeps Zustand in-memory state and AsyncStorage in sync,
            // preventing the "refresh_token_already_used" desync bug.
            useAuthStore.setState({ session: refreshed });

            console.log(`${TAG} Token refreshed successfully (new expires_at=${refreshed.expires_at})`);
            return refreshed.access_token as string;
        } finally {
            refreshInFlight = null;
        }
    })();

    return refreshInFlight;
}
