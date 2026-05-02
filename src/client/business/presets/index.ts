'use client';
import {TabManager} from "@/client/components/tab";
import {registerLorebook} from "./lorebooks";
import {tabConfig as normalTab} from "./normal/content";
import {tabConfig as lorebookTab} from "./lorebooks/content";
import {tabConfig as styleTab} from "./styles/content";
import {tabConfig as scriptTab} from "./scripts/content";
import {tabConfig as regexTab} from "./regexes/content";

export const presetTabManager = new TabManager("preset tabs");

export function registerPreset() {
    presetTabManager
        .register(
            normalTab,
            lorebookTab,
            scriptTab,
            styleTab,
            regexTab,
        );
    registerLorebook();
}

