import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
    paymentService,
} from "@/services/paymentService";
import { CreateCheckoutInput, CreateCheckoutResponse } from "@/types/payment";

type PaymentState = {
    checkout: CreateCheckoutResponse | null;
    loading: boolean;
    error: string | null;
    errorStatus?: number;
    hydrated: boolean;

    createCheckout: (input: CreateCheckoutInput) => Promise<CreateCheckoutResponse>;

    setCheckout: (checkout: CreateCheckoutResponse | null) => void;
    clearCheckout: () => void;
    resetError: () => void;
};

function parseError(e: any): { message: string; status?: number } {
    const status = e?.response?.status ?? e?.status;
    const message =
        e?.response?.data?.message ??
        e?.message ??
        "Ocorreu um erro inesperado";
    return { message, status };
}

export const usePaymentStore = create<PaymentState>()(
    persist(
        (set) => ({
            checkout: null,
            loading: false,
            error: null,
            errorStatus: undefined,
            hydrated: false,

            resetError: () => set({ error: null, errorStatus: undefined }),

            setCheckout: (checkout) => set({ checkout }),

            clearCheckout: () =>
                set({
                    checkout: null,
                    loading: false,
                    error: null,
                    errorStatus: undefined,
                }),

            createCheckout: async (input) => {
                try {
                    set({ loading: true, error: null, errorStatus: undefined });

                    const res = await paymentService.createCheckout(input);
                    console.log("res =====> ", res)
                    set({ checkout: res, loading: false });
                    return res;
                } catch (e: any) {
                    const { message, status } = parseError(e);

                    set({ loading: false, error: message, errorStatus: status });
                    throw e;
                }
            },
        }),
        {
            name: "payment-store",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ checkout: state.checkout }),
            onRehydrateStorage: () => (state, error) => {
                usePaymentStore.setState({ hydrated: true });
                if (error) console.log("❌ payment rehydrate error:", error);
            },
        }
    )
);
