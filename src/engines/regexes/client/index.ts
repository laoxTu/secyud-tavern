import {presetTabManager} from "@/presets/client/tabs";
import {tabConfig} from "./preset-tab";


export function registerRegexesClient() {
    presetTabManager.register(tabConfig);
}