import { CreateCheckoutInput, CreateCheckoutResponse } from "@/types/payment";
import { api } from "./api";
import { getValidAccessToken } from "./auth/token";

export const paymentService = {
  createCheckout: async (input: CreateCheckoutInput) => {
    const token = await getValidAccessToken();

    return api<CreateCheckoutResponse>({
      path: "/payments",
      method: "POST",
      body: input,
      token,
    });
  },
};