import {PluginManifest} from "@/plugins/models";
import {getInstance, ServerRegistry} from "@/plugins/server";
import {manifests} from "./manifests";

export class PluginManager extends ServerRegistry<PluginManifest> {
    constructor(name: string) {
        super(name);
    }
}

export const pluginManager =
    getInstance("pluginManager", u => {
        const instance = new PluginManager(u);
        instance.register(...manifests)
        return instance;
    });