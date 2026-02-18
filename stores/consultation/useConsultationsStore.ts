// stores/consultations/useConsultationsStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ResConsultation } from "@/services/consultationService";
import { consultationService } from "@/services/consultationService";

type ConsultationState = {
    consultation: ResConsultation | null;

    loading: boolean;
    error: string | null;
    errorStatus?: number;
    hydrated: boolean;

    getConsultation: (input: { id: string }) => Promise<ResConsultation | null>;
    updateConsultation: (input: {
        id: string;
        data: Partial<Pick<ResConsultation, "patient_name" | "guardian_name">>;
    }) => Promise<ResConsultation>;

    setConsultation: (c: ResConsultation | null) => void;

    clearConsultation: () => void;
    resetError: () => void;
};

function parseError(e: any): { message: string; status?: number } {
    const status = e?.response?.status ?? e?.status;
    const message =
        e?.response?.data?.message ??
        e?.details?.message ??
        e?.message ??
        "Ocorreu um erro inesperado";
    return { message, status };
}

export const useConsultationsStore = create<ConsultationState>()(
    persist(
        (set, get) => ({
            consultation: null,

            loading: false,
            error: null,
            errorStatus: undefined,
            hydrated: false,

            resetError: () => set({ error: null, errorStatus: undefined }),

            setConsultation: (c) => set({ consultation: c }),

            clearConsultation: () =>
                set({
                    consultation: null,
                    loading: false,
                    error: null,
                    errorStatus: undefined,
                }),

            getConsultation: async ({ id }) => {
                try {
                    if (get().loading) return get().consultation;

                    set({ loading: true, error: null, errorStatus: undefined });

                    const data = await consultationService.getConsultation({ id });

                    set({ consultation: data, loading: false });
                    return data;
                } catch (e: any) {
                    const { message, status } = parseError(e);

                    if (status === 404) {
                        set({
                            consultation: null,
                            loading: false,
                            error: null,
                            errorStatus: 404,
                        });
                        return null;
                    }

                    set({ loading: false, error: message, errorStatus: status });
                    throw e;
                }
            },

            updateConsultation: async ({ id, data }) => {
                try {
                    if (get().loading) throw new Error("Já existe uma operação em andamento.");

                    set({ loading: true, error: null, errorStatus: undefined });

                    const updated = await consultationService.updateConsultation({ id, data });

                    set({
                        consultation: updated,
                        loading: false,
                    });

                    return updated;
                } catch (e: any) {
                    const { message, status } = parseError(e);
                    set({ loading: false, error: message, errorStatus: status });
                    throw e;
                }
            },
        }),
        {
            name: "consultations-store",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ consultation: state.consultation }),
            onRehydrateStorage: () => (state, error) => {
                useConsultationsStore.setState({ hydrated: true });
                if (error) console.log("❌ rehydrate error:", error);
            },
        }
    )
);
