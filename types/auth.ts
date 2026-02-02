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
  userId: string;
};

export type ChangePasswordResponse = {
  message: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};