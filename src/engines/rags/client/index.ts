import {settingTabManager} from "@/modules/settings/client/tabs";
import {settingTab} from "./setting-tab";
import {embeddingGeneratorManager} from "@/engines/rags/client/embedding";
import {transformersEmbeddingGenerator} from "@/engines/rags/embedding/transformers/client";

export function registerRagsClient() {
    settingTabManager.register(
        settingTab
    );
    embeddingGeneratorManager.register(
        transformersEmbeddingGenerator
    );
}