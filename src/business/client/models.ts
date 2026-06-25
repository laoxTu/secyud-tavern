'use client'
import {create, StoreApi, UseBoundStore} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";
import {PagedItemsState} from "@/components/custom/pager";
import {TabManager} from "@/components/custom/tab";

export type UseStoreState<T> = UseBoundStore<StoreApi<T>>;

export interface ModelState<T> {
    moduleName: string;
    modulePlural: string;
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
    setModel: (model?: T) => void;
}

export function createUseItemState<T>(name?: string) {
    const func =
        (set: (partial: Partial<ItemState<T>>) => void): ItemState<T> => ({
            setModel(model) {
                set({model})
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