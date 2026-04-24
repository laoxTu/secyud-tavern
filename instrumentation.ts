// instrumentation.ts
import {createDb} from "@/src/db";
import {interceptor} from "@/src/interceptor";
import {pluginManager} from "@/src/plugins";
import {errorInterceptor} from "@/src/utils/error-interceptor";
import {paramInterceptor} from "@/src/utils/param-interceptor";
import i18nInterceptor from "@/src/localization/interceptor";
import {registerLayoutTabs} from "@/components/business/layout";

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs')
    {
        interceptor.register(errorInterceptor);
        interceptor.register(paramInterceptor);
        interceptor.register(i18nInterceptor);

        await pluginManager.loadServerPlugins();

        await createDb();
    }
}