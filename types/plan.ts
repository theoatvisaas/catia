// types/plan.ts
export type Plan = {
    id: string;
    title: string;
    advantages: string[];
    isFeatured: boolean;
    monthly_amount: string;
};

export type PlansResponse = {
    plans: Plan[];
};
