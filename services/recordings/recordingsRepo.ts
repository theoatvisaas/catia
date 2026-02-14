import { getAuthenticatedSupabase } from "@/lib/supabase/supabase";
import { SexKey } from "@/types/uploadTypes";


export type CreateRecordingRow = {
    user_id: string;
    storage_bucket: string;
    storage_path: string;
    patient_name: string;
    guardian_name: string;
    sex: SexKey;
    duration_ms: number;
};

export async function createRecording(row: CreateRecordingRow) {
    const supabase = await getAuthenticatedSupabase();
    const { data, error } = await supabase
        .from("recordings")
        .insert(row)
        .select("*")
        .single();

    if (error) throw error;
    return data;
}
