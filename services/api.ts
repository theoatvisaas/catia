import { useAuthStore } from "@/stores/auth/useAuthStore";

export type ApiError = {
    status: number;
    message: string;
    details?: unknown;
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL as string;

function buildHeaders(token?: string, extra?: Record<string, string>) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(extra ?? {}),
    };

    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
}

async function parseJsonSafe(res: Response) {
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

export async function apiRequest<T>(input: {
    path: string;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    token?: string;
    headers?: Record<string, string>;
}): Promise<T> {
    if (!BASE_URL) {
        throw { status: 0, message: "Missing EXPO_PUBLIC_API_URL in env" } satisfies ApiError;
    }

    const sessionToken = useAuthStore.getState().session?.access_token;
    const tokenToUse = input.token ?? sessionToken;

    const res = await fetch(`${BASE_URL}${input.path}`, {
        method: input.method ?? "GET",
        headers: buildHeaders(tokenToUse, input.headers),
        body: input.body ? JSON.stringify(input.body) : undefined,
    });

    const data = await parseJsonSafe(res);

    if (!res.ok) {
        const message =
            (data &&
                typeof data === "object" &&
                "message" in (data as any) &&
                (data as any).message) ||
            `Request failed (${res.status})`;

        throw {
            status: res.status,
            message,
            details: data,
        } satisfies ApiError;
    }

    return data as T;
}
