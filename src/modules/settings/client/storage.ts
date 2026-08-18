import {StateStorage} from "zustand/middleware";
import {get, put} from "@/client";

export const remoteStorage: StateStorage = {
    getItem: async (name: string) => {
        const {data} = await get(`/settings/{id}`, {
            params: {id: name},
        });
        return data ?? null;
    },

    setItem: async (name: string, value: string) => {
        await put(`/settings/{id}`, {data: value}, {
            params: {id: name},
        });
    },

    removeItem: async (name: string) => {
        await put(`/settings/{id}`, {data: null}, {
            params: {id: name},
        });
    },
};