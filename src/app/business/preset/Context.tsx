// contexts/PresetContext.tsx
'use client';
import {createContext, useContext} from "react";
import {PresetModel} from "@/business/preset/models";

interface PresetContextType {
    preset: PresetModel;
    refreshPreset: () => void;
}

export const PresetContext = createContext<PresetContextType | null>(null);

export function usePresetContext() {
    const context = useContext(PresetContext);
    if (context === null) {
        throw new Error('usePresetContext must be used within a PresetContextProvider');
    }
    return context;
}
interface PresetListContextType {
    refreshPresetList: () => void;
}

export const PresetListContext = createContext<PresetListContextType | null>(null);

export function usePresetListContext() {
    const context = useContext(PresetListContext);
    if (context === null) {
        throw new Error('usePresetContext must be used within a PresetContextProvider');
    }
    return context;
}