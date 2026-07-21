'use client'
import {create, StoreApi, UseBoundStore} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";
import {createUsePagedItemsState, PagedItemsState} from "@/components/custom/pager";
import {TabManager} from "@/components/custom/tab";
import {get} from "@/client";
import {ImageFile} from "@/business/models";
import {Registerable} from "@/utils/register";
import React from "react";

export interface EditorRegisterable extends Registerable {
    component: React.ComponentType<any>,
}

export type UseStoreState<T> = UseBoundStore<StoreApi<T>>;

export interface ModelState<T> {
    moduleName: string;
    useItemState: UseStoreState<ItemState<T>>;
    usePagedItemsState: UseStoreState<PagedItemsState<T>>;
}

export interface EntryState<T> {
    moduleName: string;
    modulePlural: string;
    entryType: string;
    usePagedItemsState: UseStoreState<PagedItemsState<T>>;
}

export interface ItemState<T> {
    model?: T;
    render: number;
    setModel: (model?: T) => void;
}

export const useImagePagedItemsState = createUsePagedItemsState<ImageFile>(
    async options => {
        return await get('/images', {params: options})
    }, 8);


export function createUseItemState<T>(name?: string) {
    const func =
        (set: (partial: Partial<ItemState<T>>) => void, get: () => ItemState<T>): ItemState<T> => ({
            render: 0,
            setModel(model) {
                set({model, render: get().render + 1});
            }
        });

    return create<ItemState<T>>()(
        name ? persist(func,
            {
                name: name,
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({
                    model: state.model,
                }),
            }
        ) : func
    );
}

export interface TabState {
    tabId: string;
    setTabId: (tabId: string) => void;
}

export function createUseTabState(tabManager: TabManager) {
    return create<TabState>()(
        (set) => ({
            tabId: tabManager.getFirstTab()?.id ?? "",
            setTabId: (tab) => set({tabId: tab}),
        })
    );
}

export interface GlobalState {
    panelWidth: number;
    setPanelWidth: (width: number) => void;
}

export const useGlobalState = create<GlobalState>()(persist((set) => ({
    panelWidth: 320,
    setPanelWidth: (width: number) => {
        set({panelWidth: width});
    },
}), {
    name: "global-state",
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
        panelWidth: state.panelWidth,
    }),
}))