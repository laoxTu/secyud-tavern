import {TabManager} from "@/components/tab";
import PresetIndex from "@/components/business/preset/nodes/PresetIndex";

export const tabManager = new TabManager("home tabs");

export function registerLayoutTabs(){

    tabManager.register({
        component: PresetIndex, id: "preset", label: "preset"
    })
}