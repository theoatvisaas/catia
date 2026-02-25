import { authService } from "@/services/authService";
import type { AuthSessionResponse, ChangePasswordResponse } from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Replace internal/technical messages with a user-friendly fallback */
function userFacingMessage(e: any, fallback: string): string {
  const msg = e?.message;
  if (!msg || msg.startsWith("Missing ") || msg.startsWith("Request failed")) return fallback;
  return msg;
}

type AuthState = {
  session: AuthSessionResponse | null;
  loading: boolean;
  error: string | null;

  login: (input: { email: string; password: string }) => Promise<boolean>;
  signUp: (input: { name: string, email: string; password: string }) => Promise<boolean>;
  changePassword: (input: { currentPassword: string; newPassword: string }) => Promise<ChangePasswordResponse>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      loading: false,
      error: null,

      login: async ({ email, password }) => {
        set({ loading: true, error: null });
        try {
          const session = await authService.login({ email, password });
          console.log("SESSION SAVED:", session);
          set({ session, loading: false });
          return true;
        } catch (e: any) {
          set({
            loading: false,
            error: userFacingMessage(e, "Erro ao fazer login"),
          });
          return false;
        }
      },

      signUp: async ({ name, email, password }) => {
        set({ loading: true, error: null });
        try {
          const session = await authService.signUp({ name, email, password });
          set({ session, loading: false });
          return true;
        } catch (e: any) {
          set({
            loading: false,
            error: userFacingMessage(e, "Erro ao criar conta"),
          });
          return false;
        }
      },

      changePassword: async ({ currentPassword, newPassword }) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.changePassword({
            currentPassword,
            newPassword,
          });
          set({ loading: false });
          return response;
        } catch (e: any) {
          set({ loading: false, error: userFacingMessage(e, "Erro ao alterar senha") });
          throw e;
        }
      },

      logout: async () => {
        await AsyncStorage.removeItem("auth-session");
        set({ session: null, loading: false, error: null });
      },

    }),
    {
      name: "auth-session",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ session: state.session }),
    }
  )
);
