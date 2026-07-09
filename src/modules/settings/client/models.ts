import {create} from "zustand";
import {createJSONStorage, persist, StateStorage} from "zustand/middleware";
import {get, put} from "@/client";

export interface DefaultSettingState {
    author: string;
    setAuthor: (author: string) => void;
}

export const useDefaultSettingState = create<DefaultSettingState>()(
    persist((set) => ({
            author: "",
            setAuthor(author) {
                set({author});
            }
        }),
        {
            name: "defaultSettingState",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                author: state.author,
            }),
        }
    ));


export const remoteStorage: StateStorage = {
    getItem: async (name: string) => {
        const {data} = await get(`/settings/{id}`, {
            params: {id: name},
        });

        console.debug("getItem ", data);
        return data ?? null;
    },

    setItem: async (name: string, value: string) => {
        console.debug("setItem ", value);
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