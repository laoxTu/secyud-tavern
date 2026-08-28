import {Editor} from "./editor";
import {UrlFetchConfigModel} from "../models";
import {Readability} from "@mozilla/readability";
import {LlmapiTool, LlmapiToolProvider} from "@/engines/tools/client/models";
import {PresetToolConfigModel} from "@/engines/tools/models";
import {LlmapiToolModel} from "@/modules/stories/models";
import {post} from "@/client";
import {joinAsString} from "@/utils";

export const urlFetchToolProvider: LlmapiToolProvider = {
    id: "url_fetch",
    component: Editor,
    getValue: (data: FormData): UrlFetchConfigModel => {
        return {
            maxResults: parseInt(data.get('max_result_count') as string),
            timeout: parseInt(data.get('timeout') as string),
            maxLength: parseInt(data.get('max_length') as string),
        };
    },
    async create(config: PresetToolConfigModel) {
        return [new UrlFetchTool(config.value)];
    },
};

export class UrlFetchTool implements LlmapiTool {
    model: LlmapiToolModel;

    constructor(private config: UrlFetchConfigModel) {
        this.model = {
            name: 'url_fetch',
            description: `Fetch content and extract message from url(s). (max url count: ${config.maxResults})`,
            parameters: {
                type: 'object',
                additionalProperties: false,
                required: ['urls'],
                properties: {
                    urls: {
                        type: 'array',
                        description: `URLs to fetch (max ${config.maxResults})`,
                        items: {
                            type: 'string',
                            description: `URL`,
                        },
                    },
                },
            },
        }
    }

    async invoke({urls}: { urls: string[] }) {
        const targetUrls = urls.slice(0, this.config.maxResults);

        const results = [];

        for (const url of targetUrls) {
            results.push(await fetchUrl(url,
                this.config.timeout * 1000,
                this.config.maxLength));
        }

        return {
            content: joinAsString(results, "\n", u => `${u.url}\r\n${u.content ?? u.error}`),
        };
    }
}

// ============ 简化版抓取 ============
async function fetchUrl(url: string, timeout: number, maxLength: number) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        let {content, contentType}: { content: string | null | undefined, contentType: string } = await post("/proxy", {
            url,
        }, {
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.debug("[url fetch](content type): ", contentType);
        if (
            // html
            contentType.includes('html') ||
            // xml
            contentType.includes('xml')
        ) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(content ?? "", 'text/html');
            // 2. 创建 Readability 实例，传入 document 对象
            const reader = new Readability(doc);
            // 3. 解析文章
            const article = reader.parse();
            content = article?.textContent;
        }

        return {url, success: true, content: content?.substring(0, maxLength)};
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            return {url, success: false, error: 'Request timeout'};
        }
        console.warn("[url fetch]", error);
        return {
            url,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}