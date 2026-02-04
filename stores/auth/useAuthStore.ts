import { authService } from "@/services/authService";
import type { AuthSessionResponse, ChangePasswordResponse } from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthState = {
  session: AuthSessionResponse | null;
  loading: boolean;
  error: string | null;

  login: (input: { email: string; password: string }) => Promise<boolean>;
  signUp: (input: { email: string; password: string }) => Promise<boolean>;
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
            error: e?.message ?? "Erro ao fazer login",
          });
          return false;
        }
      },

      signUp: async ({ email, password }) => {
        set({ loading: true, error: null });
        try {
          const session = await authService.signUp({ email, password });
          set({ session, loading: false });
          return true;
        } catch (e: any) {
          set({
            loading: false,
            error: e?.message ?? "Erro ao criar conta",
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
          const message =
            e?.message ??
            e?.details?.message ??
            "Erro ao alterar senha";

          set({ loading: false, error: message });
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
