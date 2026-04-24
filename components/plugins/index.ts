import {registerLayoutTabs} from "@/components/business/layout";
import {pluginManager} from "@/src/plugins";


export function registerClientPlugins() {
    registerLayoutTabs();
    pluginManager.loadClientPlugins()
        .then(() => {
            console.log("[plugin] client plugins loaded")
        });
}