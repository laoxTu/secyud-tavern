// src/localization/interceptor.ts
import createMiddleware from 'next-intl/middleware';
import {defaultLocale, locales} from './config';
import {Interceptor} from "@/interceptor";
import {NextRequest, NextResponse} from "next/server";


const middleware = createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'always'
});

class I18nInterceptor implements Interceptor {

    id = "i18n interceptor";
    requires? = undefined;


    async handle(request: NextRequest, records: Record<string, any>, next: () => Promise<NextResponse>) {
        return middleware(request) ?? await next();
    }

}

const i18nInterceptor = new I18nInterceptor();
export default i18nInterceptor;