import {businessNavigationManager} from "@/business/client/navigation";
import {presetNavigationContent} from "./content";
import {def} from "@/plugins/client/api";
import * as tabs from '@/presets/client/tabs';
def('@/presets/client/tabs', tabs)
export function registerPresetClient(){
    businessNavigationManager.register(
        presetNavigationContent,
    )
}