'use client';
import {TabManager} from "@/components/tab";
import NormalNavigation from "./normal/Navigation";
import NormalContent from "./normal/Content";

export const presetTabManager = new TabManager("preset tabs");

export {default as PresetNavigation} from "./Navigation"
export {usePresetContext, usePresetListContext} from "./Context"

export function initializePreset() {
    presetTabManager.register({
        id: "normal", label: NormalNavigation, component: NormalContent,
    })
}

