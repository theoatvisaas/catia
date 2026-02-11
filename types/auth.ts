export type AuthSessionResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at?: number;
  user: { id: string; email?: string };
};

export type LoginResponse = AuthSessionResponse;
export type SignUpResponse = AuthSessionResponse;

export type MeResponse = {
  user: { id: string; email?: string | null };
  client?: {
    id: string;
    name: string;
    status: boolean;
    funnel_phase: string;
    stripe_customer_id?: string | null;
  } | null;
};

export type StoredMe = MeResponse;

export type StoredUser = {
  id: string;
  email?: string | null;
};



export type ChangePasswordResponse = {
  message: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};