import { ts } from "@/lib/logger";
import { getAuthenticatedSupabase } from "@/lib/supabase/supabase";
import type { RemoteConsultation } from "@/types/consultationTypes";
import type { SexKey } from "@/types/uploadTypes";

const TAG = "[FetchService]";
const PAGE_SIZE = 20;

// ── Supabase row shape ──────────────────────────────────

type ConsultationRow = {
    session_id: string;
    user_id: string;
    storage_bucket: string;
    storage_prefix: string;
    patient_name: string | null;
    guardian_name: string | null;
    sex: SexKey;
    duration_ms: number;
    chunk_count: number;
    status: string;
    created_at: string;
    finalized_at: string;
};

// ── Mapper ──────────────────────────────────────────────

function mapRow(row: ConsultationRow): RemoteConsultation {
    return {
        sessionId: row.session_id,
        userId: row.user_id,
        patientName: row.patient_name ?? "",
        guardianName: row.guardian_name ?? "",
        sex: row.sex,
        syncStatus: "synced",
        durationMs: row.duration_ms,
        chunkCount: row.chunk_count,
        createdAt: new Date(row.created_at).getTime(),
        finalizedAt: new Date(row.finalized_at).getTime(),
        storageBucket: row.storage_bucket,
        storagePrefix: row.storage_prefix,
    };
}

// ── Public API ──────────────────────────────────────────

export type FetchConsultationsResult = {
    data: RemoteConsultation[];
    hasMore: boolean;
};

/**
 * Fetch one page of synced consultations from Supabase.
 *
 * Uses range-based pagination: page 0 = rows 0..19, page 1 = rows 20..39, etc.
 * Ordered by `created_at DESC` (newest first).
 *
 * RLS on the `consultations` table scopes results to the authenticated user
 * automatically via the Bearer token in `getAuthenticatedSupabase()`.
 */
export async function fetchConsultationsPage(
    page: number,
): Promise<FetchConsultationsResult> {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    console.log(`${ts(TAG)} fetchConsultationsPage(${page}) | range ${from}..${to}`);

    const supabase = await getAuthenticatedSupabase();

    const { data, error, count } = await supabase
        .from("consultations")
        .select("*", { count: "exact" })
        .eq("status", "synced")
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        console.error(`${ts(TAG)} fetchConsultationsPage() | ERROR: ${error.message}`);
        throw new Error(`Failed to fetch consultations: ${error.message}`);
    }

    const rows = (data ?? []) as ConsultationRow[];
    const mapped = rows.map(mapRow);
    const hasMore = count != null
        ? from + rows.length < count
        : rows.length === PAGE_SIZE;

    console.log(
        `${ts(TAG)} fetchConsultationsPage(${page}) | fetched ${mapped.length} rows | hasMore=${hasMore} | total=${count ?? "?"}`
    );

    return { data: mapped, hasMore };
}
