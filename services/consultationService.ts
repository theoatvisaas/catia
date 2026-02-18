// services/consultationService.ts
import { api } from "./api";
import { getValidAccessToken } from "./auth/token";

export type IdConsultation = { id: string };

export type ResConsultation = {
    patient_name: string | null;
    guardian_name: string | null;
};

export const consultationService = {
    getConsultation: async ({ id }: IdConsultation) => {
        const token = await getValidAccessToken();

        try {
            const r = await api<{ consultation: any }>({
                path: `/consultations/${id}`,
                method: "GET",
                token,
            });

            console.log("RAW RESPONSE", r);
            return r?.consultation ?? null;
        } catch (e: any) {
            console.log("CONSULTATION GET ERROR (service):", {
                status: e?.response?.status ?? e?.status,
                message: e?.response?.data?.message ?? e?.message,
                data: e?.response?.data,
            });
            throw e;
        }
    },



    updateConsultation: async (input: {
        id: string;
        data: Partial<Pick<ResConsultation, "patient_name" | "guardian_name">>;
    }) => {
        const token = await getValidAccessToken();

        return api<{ consultation: ResConsultation }>({
            path: `/consultations/${input.id}`,
            method: "PUT",
            body: input.data,
            token,
        }).then((r) => r.consultation);
    },
};
