import { IdDoc, ResDoc, ResponseDocuments } from "@/types/documents";
import { api } from "./api";
import { getValidAccessToken } from "./auth/token";

export const documentService = {

    getByConsultationId: async ({ id }: IdDoc) => {
        const token = await getValidAccessToken();

        return api<ResponseDocuments>({
            path: `/documents/${id}`,
            method: "GET",
            token,
        }).then((r) => r.documents);
    },

    uploadDocument: async (input: {
        title: string;
        text: string;
        document_type_id: string;
    }) => {
        const token = await getValidAccessToken();

        return api<{ document: ResDoc }>({
            path: `/documents/upload`,
            method: "POST",
            body: input,
            token,
        }).then((r) => r.document);
    },

    updateDocument: async (input: { id: string; data: Partial<Pick<ResDoc, "title" | "text">> }) => {
        const token = await getValidAccessToken();

        return api<{ document: ResDoc }>({
            path: `/documents/${input.id}`,
            method: "PATCH",
            body: input.data,
            token,
        }).then((r) => r.document);
    },

};
