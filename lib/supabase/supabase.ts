import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getValidAccessToken } from "@/services/auth/token";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY");
}

/** Supabase client with anon key (no user auth). Used by AuthProvider listener. */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

/**
 * Creates a Supabase client authenticated with the user's backend token.
 *
 * Since the app uses a custom backend for auth (not Supabase Auth),
 * the default `supabase` client has no user session. This function
 * reads the token from the custom auth store and creates a client
 * with the Authorization header set to `Bearer <token>`.
 *
 * Use this for any operation that requires user-level RLS permissions
 * (Storage uploads, DB inserts, etc.).
 *
 * @throws Error if no valid token is available (user not logged in)
 */
export async function getAuthenticatedSupabase(): Promise<SupabaseClient> {
    const token = await getValidAccessToken();

    if (!token) {
        throw new Error("No valid access token — user may be logged out");
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
        },
        global: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    });
}
