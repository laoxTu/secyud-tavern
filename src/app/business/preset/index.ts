
import {TabManager} from "@/components/tab";
import {PresetModel} from "@/business/preset/models";
export const presetTabManager = new TabManager<{ preset: PresetModel }>("preset tabs");

export function initializePreset() {

    // presetTabManager.register({
    //     id: "preset", label: PresetNavigation
    // })
}