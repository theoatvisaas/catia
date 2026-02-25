import { ts } from "@/lib/logger";
import { showToast } from "@/providers/ToastProvider";
import { fetchConsultationsPage } from "@/services/recordings/consultationFetchService";
import type { RemoteConsultation } from "@/types/consultationTypes";
import { create } from "zustand";

const TAG = "[RemoteConsultationsStore]";

// ── Types ────────────────────────────────────────────────

type RemoteConsultationsStore = {
    items: RemoteConsultation[];
    page: number;
    hasMore: boolean;
    isLoading: boolean;
    isLoadingMore: boolean;
    error: string | null;

    /** Guard: true while refresh() is in-flight (prevents concurrent calls) */
    _refreshing: boolean;
    /** Guard: true while loadMore() is in-flight */
    _loadingMore: boolean;

    /** Fetch page 0 — resets all state (prefetch / mount / pull-to-refresh) */
    refresh: () => Promise<void>;
    /** Fetch the next page — appends to items (infinite scroll) */
    loadMore: () => Promise<void>;
};

// ── Store ────────────────────────────────────────────────

export const useRemoteConsultationsStore = create<RemoteConsultationsStore>()(
    (set, get) => ({
        items: [],
        page: 0,
        hasMore: true,
        isLoading: false,
        isLoadingMore: false,
        error: null,
        _refreshing: false,
        _loadingMore: false,

        refresh: async () => {
            if (get()._refreshing) {
                console.log(`${ts(TAG)} refresh() SKIPPED — already refreshing`);
                return;
            }

            console.log(`${ts(TAG)} refresh() START`);
            set({ _refreshing: true, isLoading: true, error: null });

            try {
                const result = await fetchConsultationsPage(0);
                set({
                    items: result.data,
                    hasMore: result.hasMore,
                    page: 1,
                });
                console.log(
                    `${ts(TAG)} refresh() OK | ${result.data.length} items | hasMore=${result.hasMore}`
                );
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                set({ error: msg, items: [], hasMore: false });
                console.warn(`${ts(TAG)} refresh() ERROR: ${msg}`);
                showToast("Erro ao carregar consultas. Puxe para atualizar.");
            } finally {
                set({ isLoading: false, _refreshing: false });
            }
        },

        loadMore: async () => {
            const state = get();
            if (state._refreshing || state._loadingMore || !state.hasMore) return;

            console.log(`${ts(TAG)} loadMore() START | page=${state.page}`);
            set({ _loadingMore: true, isLoadingMore: true, error: null });

            try {
                const result = await fetchConsultationsPage(state.page);
                set((prev) => ({
                    items: [...prev.items, ...result.data],
                    hasMore: result.hasMore,
                    page: prev.page + 1,
                }));
                console.log(
                    `${ts(TAG)} loadMore() OK | +${result.data.length} items | hasMore=${result.hasMore}`
                );
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                set({ error: msg });
                console.warn(`${ts(TAG)} loadMore() ERROR: ${msg}`);
                showToast("Erro ao carregar consultas. Puxe para atualizar.");
            } finally {
                set({ isLoadingMore: false, _loadingMore: false });
            }
        },
    })
);
