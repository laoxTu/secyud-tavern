import {create} from "zustand";
import {createJSONStorage, persist, StateStorage} from "zustand/middleware";
import {get, put} from "@/client";
import {RequireModel} from "@/modules/presets/models";

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

export interface RemoteSettingState {
    llmapi: RequireModel | null;
    setLlmapi: (llmapi: RequireModel | null) => void;
}

export const useRemoteSettingState = create<RemoteSettingState>()(
    persist((set) => ({
            llmapi: null,
            setLlmapi(llmapi) {
                set({llmapi});
            }
        }),
        {
            name: "defaultSettingState",
            storage: createJSONStorage(() => remoteStorage),
            partialize: (state) => ({
                llmapi: state.llmapi,
            }),
        }
    ));


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