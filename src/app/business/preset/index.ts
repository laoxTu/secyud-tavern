'use client';
import {TabManager} from "@/components/tab";
import NormalNavigation from "./normal/Navigation";
import NormalContent from "./normal/Content";
import LorebookNavigation from "@/app/business/preset/lorebook/Navigation";
import LorebookContent from "@/app/business/preset/lorebook/Content";
import StyleNavigation from "@/app/business/preset/style/Navigation";
import StyleContent from "@/app/business/preset/style/Content";
import ScriptNavigation from "@/app/business/preset/script/Navigation";
import ScriptContent from "@/app/business/preset/script/Content";
import {initializeLorebook} from "@/app/business/preset/lorebook";
import {createContext, useContext} from "react";
import {PresetModel} from "@/business/preset/models";

export const presetTabManager = new TabManager("preset tabs");

export {default as PresetNavigation} from "./Navigation"

interface PresetContextType {
    preset?: PresetModel;
    setPreset: (preset?: PresetModel) => void;
    refreshPreset: () => Promise<void>;
    refreshPresetList: () => Promise<void>;
}

export const PresetContext = createContext<PresetContextType | null>(null);

export function usePresetContext() {
    const context = useContext(PresetContext);
    if (context === null) {
        throw new Error('usePresetContext must be used within a PresetContextProvider');
    }
    return context;
}

export function initializePreset() {
    presetTabManager
        .register(
            {
                id: "normal", label: NormalNavigation, component: NormalContent,
            },
            {
                id: "lorebook", label: LorebookNavigation, component: LorebookContent,
            },
            {
                id: "script", label: ScriptNavigation, component: ScriptContent,
            },
            {
                id: "style", label: StyleNavigation, component: StyleContent,
            },
        );
    initializeLorebook();
}

