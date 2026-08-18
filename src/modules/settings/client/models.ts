'use client';
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";

import {RemoteSettingState} from "@/modules/settings/models";
import {remoteStorage} from "./storage";


export interface LocalSettingState {
    author: string;
    setAuthor: (author: string) => void;
}

export const useLocalSettingState = create<LocalSettingState>()(
    persist((set) => ({
            author: "",
            setAuthor(author) {
                set({author});
            }
        }),
        {
            name: "localSettingState",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                author: state.author,
            }),
        }
    ));


export const useRemoteSettingState = create<RemoteSettingState>()(
    persist<RemoteSettingState>(() => ({
            llmapi: null,
        }),
        {
            name: "remoteSettingState",
            storage: createJSONStorage(() => remoteStorage),
            partialize: (state) => ({
                llmapi: state.llmapi,
            }),
        }
    )
);