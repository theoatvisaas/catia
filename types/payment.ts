export type BillingPlan = "basic" | "pro" | "premium";

export type CreateCheckoutInput = {
  stripe_price_id: string;
  plan_rank_tier: number;
};

export type CreateCheckoutResponse = {
  customerId: string;
  subscriptionId: string;
  paymentIntentClientSecret: string | null;
  ephemeralKeySecret: string;
};
