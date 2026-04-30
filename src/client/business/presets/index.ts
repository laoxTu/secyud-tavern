'use client';
import {TabManager} from "@/client/components/tab";
import {PresetModel} from "@/shared/business/presets";
import {createContext, useContext} from "react";
import {registerLorebook} from "./lorebooks";
import {tabConfig as normalTab} from "./normal/page";
import {tabConfig as lorebookTab} from "./lorebooks/page";
import {tabConfig as styleTab} from "./styles/page";
import {tabConfig as scriptTab} from "./scripts/page";

export const presetTabManager = new TabManager("preset tabs");

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

export function registerPreset() {
    presetTabManager
        .register(
            normalTab,
            lorebookTab,
            scriptTab,
            styleTab,
        );
    registerLorebook();
}

