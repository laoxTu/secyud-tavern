import {Registerable} from "@/utils/register";
import {getInstance, ServerRegistry} from "@/plugins/server/index";
import {NextRouter} from "@/handler/server/interceptor";

export interface PluginRouteItem {
    action: "POST" | "DELETE" | "PUT" | "GET";
    handler: NextRouter;
}

export interface PluginRoute extends Registerable, PluginRouteItem {
}

class PluginRouteManager extends ServerRegistry<PluginRoute> {
    private routeTree?: any;

    protected invalidateCache() {
        super.invalidateCache();
        this.routeTree = null;
    }

    getRouteTree() {
        if (!this.routeTree) {
            this.routeTree = {};
            const items = this.getSorted();
            for (const item of items) {
                const paths = item.id.split("/");
                let obj = this.routeTree;
                for (const path of paths) {
                    if (!obj[path]) {
                        obj[path] = {};
                    }
                    if (path.startsWith("{") && path.endsWith("}")) {
                        obj["__dynamic"] = path;
                    }
                    obj = obj[path];
                }
                obj["__handler"] = item.handler;
            }
        }
        return this.routeTree;
    }

    registerRouteTree(obj: any, path: string = '') {
        for (const key in obj) {
            const value = obj[key];
            if (key === "POST" || key === "DELETE" || key === "PUT" || key === "GET") {
                this.register({
                    action: key,
                    handler: value,
                    requires: [],
                    id: `[${key}]/${path}`
                })
            } else {
                this.registerRouteTree(value, `${path}/${key}`);
            }
        }
    }

    static getInstance() {
        return getInstance("pluginRoute", u => new PluginRouteManager(u));
    }
}

export const pluginRouteManager = PluginRouteManager.getInstance();