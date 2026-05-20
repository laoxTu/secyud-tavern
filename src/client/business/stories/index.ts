'use client';
import {TabManager} from "@/client/components/tab";
import {tabConfig as normalTab} from "./normal/content";

export const storyTabManager = new TabManager("story tabs");

export function registerStory() {
    storyTabManager.register(
        normalTab,
    );
}

