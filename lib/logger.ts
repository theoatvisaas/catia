/**
 * Lightweight log timestamp helper.
 *
 * Usage:
 *   import { ts } from "@/lib/logger";
 *   console.log(`${ts(TAG)} message`);
 *
 * Output:
 *   [14:23:05.123] [RecordProvider] message
 */

export function ts(tag: string): string {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    const ms = String(now.getMilliseconds()).padStart(3, "0");
    return `[${h}:${m}:${s}.${ms}] ${tag}`;
}
