// src/services/plansService.ts
import type { PlansResponse } from "@/types/plan";
import { api } from "./api";
import { getValidAccessToken } from "./auth/token";

export const plansService = {
  listPlans: async () => {
    const token = await getValidAccessToken();
    return api<PlansResponse>({
      path: "/plans",
      method: "GET",
      token,
    });
  },
};
