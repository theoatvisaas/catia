// types/plan.ts
export type Plan = {
  id: string;
  title: string;
  advantages: string[];
  isFeatured: boolean;
  monthly_amount: string;
  stripe_price_id: string;
  rank_tier: number;
};

export type PlansResponse = {
  plans: Plan[];
};
