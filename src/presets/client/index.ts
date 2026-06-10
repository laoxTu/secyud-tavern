import {businessNavigationManager} from "@/business/client/navigation";
import {presetNavigationContent} from "./content";


export function registerPresetClient(){
    businessNavigationManager.register(
        presetNavigationContent,
    )
}