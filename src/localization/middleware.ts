// src/localization/middleware.ts
import createMiddleware from 'next-intl/middleware';
import {defaultLocale, locales} from '.';
import {Middleware} from "@/src/middleware";
import {NextRequest, NextFetchEvent, NextResponse} from "next/server";

const intlMiddleware = createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'always'
});

class I18nMiddleware implements Middleware {

    id = "i18n";
    requires? = undefined;
    handle(request: NextRequest, event: NextFetchEvent, response: NextResponse): NextResponse | Promise<NextResponse> {
        return intlMiddleware(request);
    }
}

const withI18n = new I18nMiddleware();
export default withI18n;