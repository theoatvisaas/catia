export type BillingPlan = "basic" | "pro" | "premium";

export type CreateCheckoutInput = {
  stripe_price_id: string
};

export type CreateCheckoutResponse = {
  customerId: string;
  subscriptionId: string;
  paymentIntentClientSecret: string | null;
  ephemeralKeySecret: string;
};