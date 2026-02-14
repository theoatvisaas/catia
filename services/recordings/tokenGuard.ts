import { getValidAccessToken } from "@/services/auth/token";
import { ts } from "@/lib/logger";

const TAG = "[TokenGuard]";

/**
 * Ensures a valid auth session exists before an upload attempt.
 *
 * Uses the app's custom backend auth system (getValidAccessToken),
 * NOT Supabase Auth — since the app authenticates via a custom
 * /auth/login endpoint, not Supabase's built-in auth.
 *
 * Returns true if we have a valid access token (or can't determine
 * — let the upload itself fail with 401 rather than blocking the queue).
 */
export async function ensureValidSession(): Promise<boolean> {
    // [TEST] Scenario 14: Simulate expired auth token
    if (__DEV__) {
        const { testFlags } = require("@/config/testFlags");
        if (testFlags.simulateTokenExpired) {
            console.log(`[TEST] Simulated: Auth token EXPIRED`);
            return false;
        }
    }

    try {
        console.log(`${ts(TAG)} ensureValidSession() | Checking for valid access token...`);

        const token = await getValidAccessToken();

        if (!token) {
            console.warn(`${ts(TAG)} ensureValidSession() | No valid token found — user may be logged out`);
            return false;
        }

        console.log(`${ts(TAG)} ensureValidSession() | ✅ Valid token found (${token.slice(0, 8)}...)`);
        return true;
    } catch (err) {
        const msg = err instanceof Error ? err.message
            : typeof err === "object" && err !== null && "message" in err
                ? (err as any).message
                : JSON.stringify(err);
        console.warn(`${ts(TAG)} ensureValidSession() | ⚠️ Error checking token: ${msg}`);
        return false;
    }
}
