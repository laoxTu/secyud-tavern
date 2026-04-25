// src/localization/request.ts
import {defaultLocale, timeZones, locales, localizationPaths} from "@/src/localization/config";
import {getRequestConfig, RequestConfig} from "next-intl/server";
import {notFound} from "next/navigation";

export default getRequestConfig(async ({locale}) => {
    const currentLocale = locale || defaultLocale;

    if (!locales.includes(currentLocale)) {
        notFound();
    }

    // 解析完整的配置
    const config = currentLocale.split("-");
    const language = config[0];
    const region = config.length > 1 ? config[1] : "CN";

    let allMessages = {};

    // 遍历所有路径
    for (const path of localizationPaths) {
        // 跳过空路径
        if (!path || path.trim() === '') continue;

        try {
            const messages = (await import(`@/${path}/${language}.json`)).default;
            allMessages = {...allMessages, ...messages};
            console.log(`✅ loading localization file: ${path}/${language}.json`);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
            // 文件不存在，跳过
            console.log(`⚠️ localization file not found: ${path}/${language}.json`);
        }
    }

    const res: RequestConfig = {
        locale: currentLocale,
        messages: allMessages,
        timeZone: timeZones[region],
        now: new Date()
    };
    return res;
});