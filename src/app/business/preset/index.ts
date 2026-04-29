'use client';
import {TabManager} from "@/components/tab";
import NormalNavigation from "./normal/Navigation";
import NormalContent from "./normal/Content";
import LorebookNavigation from "@/app/business/preset/lorebook/Navigation";
import LorebookContent from "@/app/business/preset/lorebook/Content";
import {initializeLorebook} from "@/app/business/preset/lorebook";

export const presetTabManager = new TabManager("preset tabs");

export {default as PresetNavigation} from "./Navigation"
export {usePresetContext, usePresetListContext} from "./Context"

export function initializePreset() {
    presetTabManager
        .register(
            {
                id: "normal", label: NormalNavigation, component: NormalContent,
            },
            {
                id: "lorebook", label: LorebookNavigation, component: LorebookContent,
            }
        );
    initializeLorebook();
}

