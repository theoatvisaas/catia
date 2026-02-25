import { getAuthenticatedSupabase } from "@/lib/supabase/supabase";
import type { Plan } from "@/types/plan";

export const plansService = {
    listPlans: async (): Promise<Plan[]> => {
        const sb = await getAuthenticatedSupabase();
        const { data, error } = await sb
            .from("plans")
            .select("id,title,monthly_amount,advantages,isFeatured,stripe_price_id,rank_tier")
            .order("order", { ascending: true });

        if (error) {
            throw { status: 500, message: error.message };
        }

        return (data ?? []) as Plan[];
    },
};
