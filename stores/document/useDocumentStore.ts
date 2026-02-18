import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { documentService } from "@/services/documentService";
import type { ResDoc } from "@/types/documents";

type DocumentState = {
    document: ResDoc | null;
    documents: ResDoc[];

    loading: boolean;
    error: string | null;
    errorStatus?: number;
    hydrated: boolean;

    getDocuments: (input: { id: string }) => Promise<ResDoc[] | null>;
    uploadDocument: (input: {
        title: string;
        text: string;
        document_type_id: string;
    }) => Promise<ResDoc>;

    setDocument: (doc: ResDoc | null) => void;
    setDocuments: (docs: ResDoc[]) => void;

    clearDocument: () => void;
    clearDocuments: () => void;
    resetError: () => void;

    updateDocument: (input: {
        id: string;
        data: Partial<Pick<ResDoc, "title" | "text">>;
    }) => Promise<ResDoc>;

};

function parseError(e: any): { message: string; status?: number } {
    const status = e?.response?.status ?? e?.status;
    const message =
        e?.response?.data?.message ??
        e?.details?.message ??
        e?.message ??
        "Ocorreu um erro inesperado";
    return { message, status };
}

export const useDocumentStore = create<DocumentState>()(
    persist(
        (set, get) => ({
            document: null,
            documents: [],

            loading: false,
            error: null,
            errorStatus: undefined,
            hydrated: false,

            resetError: () => set({ error: null, errorStatus: undefined }),

            setDocument: (doc) => set({ document: doc }),
            setDocuments: (docs) => set({ documents: docs }),

            clearDocument: () =>
                set({
                    document: null,
                    loading: false,
                    error: null,
                    errorStatus: undefined,
                }),

            clearDocuments: () =>
                set({
                    documents: [],
                    loading: false,
                    error: null,
                    errorStatus: undefined,
                }),

            getDocuments: async ({ id }) => {
                try {
                    if (get().loading) return get().documents;

                    set({ loading: true, error: null, errorStatus: undefined });

                    const docs = await documentService.getByConsultationId({ id });

                    set({ documents: docs, loading: false });
                    return docs;
                } catch (e: any) {
                    const { message, status } = parseError(e);

                    if (status === 404) {
                        set({
                            document: null,
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

            uploadDocument: async (input) => {
                try {
                    if (get().loading) throw new Error("Já existe uma operação em andamento.");

                    set({ loading: true, error: null, errorStatus: undefined });

                    const created = await documentService.uploadDocument(input);

                    set({
                        document: created,
                        documents: [created, ...get().documents],
                        loading: false,
                    });

                    return created;
                } catch (e: any) {
                    const { message, status } = parseError(e);
                    set({ loading: false, error: message, errorStatus: status });
                    throw e;
                }
            },
            updateDocument: async ({ id, data }) => {
                try {
                    if (get().loading) throw new Error("Já existe uma operação em andamento.");

                    set({ loading: true, error: null, errorStatus: undefined });

                    const updated = await documentService.updateDocument({ id, data });

                    set({
                        document: updated,
                        documents: get().documents.map((d) => (d.id === updated.id ? updated : d)),
                        loading: false,
                    });

                    return updated;
                } catch (e: any) {
                    const { message, status } = parseError(e);
                    set({ loading: false, error: message, errorStatus: status });
                    throw e;
                }
            },

        }),
        {
            name: "document-store",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ document: state.document, documents: state.documents }),
            onRehydrateStorage: () => (state, error) => {
                useDocumentStore.setState({ hydrated: true });
                if (error) console.log("❌ rehydrate error:", error);
            },
        }
    )
);
