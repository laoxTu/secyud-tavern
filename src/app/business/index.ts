
import {TabManager} from "@/components/tab";
import {initializePreset} from "@/app/business/preset";
import {PresetNavigation} from "./preset";


export const businessNavigationManager = new TabManager("home tabs");

export function initializeBusiness() {

    businessNavigationManager.register({
        id: "preset", label: PresetNavigation
    })

    initializePreset();
}