import { getAuthenticatedSupabase } from "@/lib/supabase/supabase";
import type { ResponseClient, UpdateClientInput } from "@/types/client";

export const clientService = {
    getClient: async (): Promise<ResponseClient> => {
        const sb = await getAuthenticatedSupabase();
        const { data, error } = await sb.from("clients").select("*").single();

        if (error) {
            throw {
                status: error.code === "PGRST116" ? 404 : 500,
                message: error.message,
            };
        }

        return data as ResponseClient;
    },

    updateClient: async ({ id, data: fields }: UpdateClientInput): Promise<ResponseClient> => {
        const sb = await getAuthenticatedSupabase();
        const { data, error } = await sb
            .from("clients")
            .update(fields)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            throw { status: 500, message: error.message };
        }

        return data as ResponseClient;
    },
};
