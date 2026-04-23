// src/localization/index.ts
import createNextIntlPlugin from "next-intl/plugin";

export const locales: string[] = ["zh", "en"];
export const defaultLocale = 'zh';
export const localizationPaths = ['localization'];

export const timeZones: Record<string, string> = {
    "CN": "Asia/Shanghai",
    "US": "America/Los_Angeles",
    "JP": "Asia/Tokyo",
    "EU": "Europe/London",
    "KR": "Asia/Seoul",
    "AU": "Australia/Sydney",
    "IN": "Asia/Kolkata",
};

export const withNextIntlConfig = createNextIntlPlugin('@/src/localization/request.ts');

export {default as intlMiddleware} from "./middleware";