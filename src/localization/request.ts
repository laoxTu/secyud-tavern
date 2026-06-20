// src/localization/request.ts
import {defaultLocale, timeZones, locales} from "@/localization/config";
import {getRequestConfig, RequestConfig} from "next-intl/server";
import {notFound} from "next/navigation";
import path from "path";
import fs from "fs/promises";
import {cookies} from "next/headers";
import {mergeObjects} from "@/utils";

const pluginDir = "plugins";

export default getRequestConfig(async ({}) => {

    const cookieStore = await cookies();
    const locale = cookieStore.get('locale')?.value;
    console.debug("[getRequestConfig] locale", locale);

    const currentLocale = locale || defaultLocale;
    if (!locales.includes(currentLocale)) {
        notFound();
    }

    // 解析完整的配置
    const config = currentLocale.split("-");
    const language = config[0];
    const region = config.length > 1 ? config[1] : "CN";

    let allMessages = {};

    const cwd = process.cwd();

    // 读取 plugins 目录下的所有文件夹
    const entries = await fs.readdir(pluginDir, {withFileTypes: true});
    const localizationPaths = entries
        .filter(entry => entry.isDirectory() && !entry.name.startsWith("_"))
        .map(entry => `${entry.parentPath}/${entry.name}`);

    localizationPaths.unshift(cwd);

    // 遍历所有路径
    for (const dirName of localizationPaths) {
        const localizationDir = path.join(/*turbopackIgnore: true*/dirName, 'localization', language);
        console.log(`[localization] analyze dir: ${localizationDir}`);
        try {
            await fs.access(localizationDir);
        } catch {
            continue;
        }
        const entries = await fs.readdir(localizationDir, {withFileTypes: true});
        const files = entries
            .filter(entry => entry.name.endsWith(".json"))
            .map(entry => entry.name);
        for (const file of files) {
            const filePath = path.join(/*turbopackIgnore: true*/localizationDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const messages = JSON.parse(content);
            allMessages = mergeObjects(allMessages, messages);
            console.log(`[localization] ✅ loading localization file: ${filePath}.json`);
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