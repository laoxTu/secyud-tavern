import {TabManager} from "@/components/tab";
import {PresetContent, PresetTab} from "../preset";

export {default as HomeContent} from "./nodes/HomeContent";

export const tabManager = new TabManager("home tabs");

export function registerLayoutTabs() {

    tabManager.register({
        component: PresetContent, id: "preset", label: PresetTab
    })
}