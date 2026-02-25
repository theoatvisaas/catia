import { useRemoteConsultationsStore } from "@/stores/consultation/useRemoteConsultationsStore";
import type { RemoteConsultation } from "@/types/consultationTypes";

export type RemoteConsultationsState = {
    /** All fetched remote consultations accumulated so far */
    items: RemoteConsultation[];
    /** Whether the initial load (page 0) is in progress */
    isLoading: boolean;
    /** Whether a "load more" fetch is in progress */
    isLoadingMore: boolean;
    /** Whether there are more pages available */
    hasMore: boolean;
    /** Error message from the most recent fetch, if any */
    error: string | null;
    /** Fetch the first page — resets all state (mount / pull-to-refresh) */
    refresh: () => Promise<void>;
    /** Fetch the next page — appends to items (scroll infinite) */
    loadMore: () => Promise<void>;
};

/**
 * Hook that reads paginated remote consultation state from the global Zustand store.
 *
 * This is a thin wrapper — all logic lives in `useRemoteConsultationsStore`.
 * The store is accessible outside React (e.g., for prefetch in ConsultationProvider).
 */
export function useRemoteConsultations(): RemoteConsultationsState {
    const items = useRemoteConsultationsStore((s) => s.items);
    const isLoading = useRemoteConsultationsStore((s) => s.isLoading);
    const isLoadingMore = useRemoteConsultationsStore((s) => s.isLoadingMore);
    const hasMore = useRemoteConsultationsStore((s) => s.hasMore);
    const error = useRemoteConsultationsStore((s) => s.error);
    const refresh = useRemoteConsultationsStore((s) => s.refresh);
    const loadMore = useRemoteConsultationsStore((s) => s.loadMore);

    return { items, isLoading, isLoadingMore, hasMore, error, refresh, loadMore };
}
