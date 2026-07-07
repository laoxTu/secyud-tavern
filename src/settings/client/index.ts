import {businessNavigationManager} from "@/business/client/navigation";
import {settingNavigationContent} from "./content";


export function registerSettingClient(){
    businessNavigationManager.register(
        settingNavigationContent,
    )
}