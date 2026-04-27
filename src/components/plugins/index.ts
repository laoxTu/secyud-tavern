import {initializeBusiness} from "@/app/business";
import {pluginManager} from "@/plugins";



export function registerClientPlugins() {
    initializeBusiness();
    pluginManager.loadClientPlugins()
        .then(() => {
            console.log("[plugin] client plugins loaded")
        });
}