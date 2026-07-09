import {businessNavigationManager} from "@/business/client/navigation";
import {storyNavigationContent} from "./content";


export function registerStoryClient(){
    businessNavigationManager.register(
        storyNavigationContent,
    )
}