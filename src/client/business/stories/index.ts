'use client';
import {TabManager} from "@/client/components/tab";
import {StoryModel} from "@/shared/business/stories";
import {createContext, useContext} from "react";
import {tabConfig as normalTab} from "./normal/page";

export const storyTabManager = new TabManager("story tabs");

interface StoryContextType {
    story?: StoryModel;
    setStory: (story?: StoryModel) => void;
    refreshStory: () => Promise<void>;
    refreshStoryList: () => Promise<void>;
}

export const StoryContext = createContext<StoryContextType | null>(null);

export function useStoryContext() {
    const context = useContext(StoryContext);
    if (context === null) {
        throw new Error('useStoryContext must be used within a StoryContextProvider');
    }
    return context;
}

export function registerStory() {
    storyTabManager
        .register(
            normalTab,
        );
}

