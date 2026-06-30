import {PluginManifest} from "@/plugins/models";
import {ServerRegistry} from "@/plugins/server";

export class PluginManager extends ServerRegistry<PluginManifest> {
    constructor(name: string) {
        super(name);
    }
}
