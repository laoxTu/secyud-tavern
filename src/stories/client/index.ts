import {businessNavigationManager} from "@/business/client/navigation";
import {storyNavigationContent} from "./content";
import * as tabs from '@/stories/client/tabs';
import {def} from "@/plugins/client/api";

def('@/stories/client/tabs', tabs)

export function registerStoryClient(){
    businessNavigationManager.register(
        storyNavigationContent,
    )
}