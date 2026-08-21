import {slotFeatureManager} from "@/modules/stories/client/feature";
import {historyDefaultFeature} from "@/modules/stories/client/history-feature";
import {businessNavigationManager} from "@/business/client/navigation";
import {storyNavigationContent} from "@/modules/stories/client/content";
import {storyTabManager} from "@/modules/stories/client/tabs";
import {tabConfig} from "@/modules/stories/client/image-tab";


export function registerStoryClient() {
    businessNavigationManager.register(
        storyNavigationContent,
    );
    storyTabManager.register(
        tabConfig
    );
    slotFeatureManager.register(
        historyDefaultFeature
    );
}