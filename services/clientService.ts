import { CreateClient, ResponseClient, UpdateClientInput } from "@/types/client";
import { api } from "./api";
import { getValidAccessToken } from "./auth/token";

export const clientService = {
    createClient: async (input: CreateClient) => {
        const token = await getValidAccessToken();
        console.log("Passando 2: ", token)
        return api<{ client: ResponseClient }>({
            path: "/client",
            method: "POST",
            body: input,
            token,
        }).then((r) => r.client);
    },

    getClient: async () => {
        const token = await getValidAccessToken();
        console.log("passando")
        const res = await api<any>({
            path: "/client",
            method: "GET",
            token,
        });

        return res.client ?? res;
    },

    updateClient: async ({ id, data }: UpdateClientInput) => {
        const token = await getValidAccessToken();

        return api<{ client: ResponseClient }>({
            path: `/client/${id}`,
            method: "PUT",
            body: data,
            token,
        }).then((r) => r.client);
    },
};
