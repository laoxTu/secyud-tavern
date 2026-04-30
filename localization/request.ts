// src/localization/request.ts
import {defaultLocale, timeZones, locales, localizationPaths} from "./config";
import {getRequestConfig, RequestConfig} from "next-intl/server";
import {notFound} from "next/navigation";
import path from "path";
import fs from "fs/promises";

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

    const processDir = process.cwd();
    // 遍历所有路径
    for (const dirName of localizationPaths) {
        // 跳过空路径
        if (!dirName || dirName.trim() === '') continue;

        const localizationDir = path.join(/*turbopackIgnore: true*/processDir, dirName, language);
        const entries = await fs.readdir(localizationDir, {withFileTypes: true});
        const files = entries
            .filter(entry => entry.name.endsWith(".json"))
            .map(entry => entry.name);
        for (const file of files) {
            const filePath = path.join(/*turbopackIgnore: true*/localizationDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const messages = JSON.parse(content);
            allMessages = {...allMessages, ...messages};
            console.log(`✅ loading localization file: ${filePath}.json`);
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