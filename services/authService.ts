import {
    ChangePasswordResponse,
    LoginResponse,
    MeResponse,
    SignUpResponse,
} from "@/types/auth";
import { api } from "./api";
import { getValidAccessToken } from "./auth/token";

export const authService = {
    signUp: (input: { name: string, email: string; password: string }) =>
        api<SignUpResponse>({
            path: "/auth/signup",
            method: "POST",
            body: input,
        }),

    login: (input: { email: string; password: string }) =>
        api<LoginResponse>({
            path: "/auth/login",
            method: "POST",
            body: input,
        }),

    me: async () => {
        const token = await getValidAccessToken();
        return api<MeResponse>({
            path: "/auth/me",
            method: "GET",
            token,
        });
    },

    changePassword: async (input: {
        currentPassword: string;
        newPassword: string;
    }) => {
        const token = await getValidAccessToken();
        return api<ChangePasswordResponse>({
            path: "/auth/change-password",
            method: "PUT",
            body: input,
            token,
        });
    },
};
