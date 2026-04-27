import {initializeBusiness} from "@/app/business";
import {pluginManager} from "@/plugins";
import {interceptor} from "@/interceptor";
import {errorInterceptor} from "@/utils/error-interceptor";
import {paramInterceptor} from "@/utils/param-interceptor";
import i18nInterceptor from "@/localization/interceptor";



export function registerClientPlugins() {

    interceptor.register(errorInterceptor);
    interceptor.register(paramInterceptor);
    interceptor.register(i18nInterceptor);
    initializeBusiness();
    pluginManager.loadClientPlugins()
        .then(() => {
            console.log("[plugin] client plugins loaded")
        });
}