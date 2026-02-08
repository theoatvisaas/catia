// src/stores/client/useClientStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { clientService } from "@/services/clientService";
import type { CreateClient, ResponseClient } from "@/types/client";

type ClientState = {
  client: ResponseClient | null;
  loading: boolean;
  error: string | null;
  errorStatus?: number;
  hydrated: boolean;

  createClient: (input: CreateClient) => Promise<ResponseClient>;
  updateClient: (input: {
    id: string;
    data: Partial<CreateClient>;
  }) => Promise<ResponseClient>;
  getClient: () => Promise<ResponseClient | null>;

  setClient: (client: ResponseClient | null) => void;
  clearClient: () => void;
  resetError: () => void;
};

function parseError(e: any): { message: string; status?: number } {
  const status = e?.response?.status ?? e?.status;
  const message =
    e?.response?.data?.message ?? e?.message ?? "Ocorreu um erro inesperado";
  return { message, status };
}

export const useClientStore = create<ClientState>()(
  persist(
    (set) => ({
      client: null,
      loading: false,
      error: null,
      errorStatus: undefined,
      hydrated: false,

      resetError: () => set({ error: null, errorStatus: undefined }),

      setClient: (client: ResponseClient | null) => set({ client }),

      clearClient: () =>
        set({
          client: null,
          loading: false,
          error: null,
          errorStatus: undefined,
        }),

      createClient: async (input: CreateClient) => {
        try {
          set({ loading: true, error: null, errorStatus: undefined });

          const created = await clientService.createClient(input);

          set({ client: created, loading: false });
          return created;
        } catch (e: any) {
          const { message, status } = parseError(e);

          set({ loading: false, error: message, errorStatus: status });
          throw e;
        }
      },

      updateClient: async ({ id, data }) => {
        try {
          set({ loading: true, error: null, errorStatus: undefined });

          const updated = await clientService.updateClient({ id, data });

          set({ client: updated, loading: false });
          return updated;
        } catch (e: any) {
          const { message, status } = parseError(e);

          set({ loading: false, error: message, errorStatus: status });
          throw e;
        }
      },

      getClient: async () => {
        try {
          set({ loading: true, error: null, errorStatus: undefined });

          const client = await clientService.getClient();

          set({ client, loading: false });
          return client;
        } catch (e: any) {
          const { message, status } = parseError(e);

          if (status === 404) {
            set({
              client: null,
              loading: false,
              error: null,
              errorStatus: 404,
            });
            return null;
          }

          set({ loading: false, error: message, errorStatus: status });
          throw e;
        }
      },
    }),
    {
      name: "client-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ client: state.client }),
      onRehydrateStorage: () => (state, error) => {
        useClientStore.setState({ hydrated: true });
        if (error) console.log("❌ rehydrate error:", error);
      },
    }
  )
);
