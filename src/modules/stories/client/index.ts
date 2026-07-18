import {businessNavigationManager} from "@/business/client/navigation";
import {storyNavigationContent} from "./content";
import {storyTabManager} from "@/modules/stories/client/tabs";
import {tabConfig} from "@/modules/stories/client/image-tab";


export function registerStoryClient(){
    businessNavigationManager.register(
        storyNavigationContent,
    );
    storyTabManager.register(
        tabConfig
    );
}