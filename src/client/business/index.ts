import {TabManager} from "@/client/components/tab";
import {tabConfig as presetPage} from "./presets/content";
import {tabConfig as storyPage} from "./stories/content";
import {tabConfig as llmapiPage} from "./llmapis/content";
import {registerPreset} from "./presets";
import {registerStory} from "@/client/business/stories";
import {registerLlmapi} from "@/client/business/llmapis";
import {registerSlot} from "@/client/business/slots";

export const businessNavigationManager = new TabManager("home tabs");

export function registerBusiness() {
    businessNavigationManager.register(
        storyPage,
        presetPage,
        llmapiPage,
    )
    registerPreset();
    registerStory();
    registerLlmapi();
    registerSlot();
}