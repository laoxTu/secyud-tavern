import {businessNavigationManager} from "@/business/client/navigation";
import {llmapiNavigationContent} from "./content";


export function registerLlmapiClient(){
    businessNavigationManager.register(
        llmapiNavigationContent,
    )
}