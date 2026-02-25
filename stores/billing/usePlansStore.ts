import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { plansService } from "@/services/plansService";
import type { Plan } from "@/types/plan";

type PlansState = {
    plans: Plan[];
    loading: boolean;
    error: string | null;
    hydrated: boolean;
    /** True after the first successful fetch (not persisted — resets on app restart) */
    fetched: boolean;

    listPlans: () => Promise<Plan[]>;
    setPlans: (plans: Plan[]) => void;
    clearPlans: () => void;
    resetError: () => void;
};

function parseError(e: any): string {
    return (
        e?.response?.data?.message ??
        e?.message ??
        "Ocorreu um erro inesperado"
    );
}

export const usePlansStore = create<PlansState>()(
    persist(
        (set) => ({
            plans: [],
            loading: false,
            error: null,
            hydrated: false,
            fetched: false,

            setPlans: (plans) => set({ plans }),
            clearPlans: () => set({ plans: [], loading: false, error: null }),
            resetError: () => set({ error: null }),

            listPlans: async () => {
                try {
                    set({ loading: true, error: null });

                    const plans = await plansService.listPlans();

                    set({ plans, loading: false, fetched: true });
                    return plans;
                } catch (e: any) {
                    set({ loading: false, error: parseError(e) });
                    throw e;
                }
            },
        }),
        {
            name: "plans-store",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ plans: state.plans }),
            onRehydrateStorage: () => (state, error) => {
                usePlansStore.setState({ hydrated: true });
                if (error) console.log("❌ plans rehydrate error:", error);
            },
        }
    )
);
