import {TabManager} from "@/client/components/tab";
import {tabConfig as presetTab} from "./presets/page";
import {tabConfig as storyTab} from "./stories/page";
import {registerPreset} from "./presets";

export const businessNavigationManager = new TabManager("home tabs");

export function registerBusiness() {
    businessNavigationManager.register(
        storyTab,
        presetTab,
    )
    registerPreset();
}