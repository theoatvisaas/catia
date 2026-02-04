

export type CreateClient = {
  name: string;
  crmv: string | null;
  specialty: string | null;
};

export type ResponseClient = {
  id: string;
  user_id: string;
  name: string;
  crmv: string | null;
  specialty: string | null;
  status: boolean;
  funnel_phase: "trial";
  trial_query_remaining: number;
  payment_customer_id: string | null;
  payment_customer_status: string | null;
  created_at: string;
};

export type UpdateClientInput = {
  id: string;
  data: Partial<CreateClient>;
}