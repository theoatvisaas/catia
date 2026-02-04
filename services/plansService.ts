// src/services/plansService.ts
import type { PlansResponse } from "@/types/plan";
import { api } from "./api";

export const plansService = {
    listPlans: async () => {
        return api<PlansResponse>({
            path: "/plans",
            method: "GET",
        });
    },
};
