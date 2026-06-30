import {getInstance} from "@/plugins/server";
import {PluginManager} from "@/plugins/manager";
import {manifests} from "./manifests";

export const pluginManager =
    getInstance("pluginManager", u => {
        const instance = new PluginManager(u);
        instance.register(...manifests)
        return instance;
    });