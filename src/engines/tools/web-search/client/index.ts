import {Editor} from "./editor";
import {WebSearchConfigModel} from "../models";
import {Readability} from "@mozilla/readability";
import {LlmapiTool, LlmapiToolContext} from "@/engines/tools/client/models";
import {LlmapiToolConfigModel} from "@/engines/tools/models";
import {LlmapiToolModel} from "@/modules/slots/models";
import {post} from "@/client";
import {joinAsString} from "@/utils";


export const webSearchTool: LlmapiTool = {
    id: 'web_search',
    component: Editor,

    getValue: (data: FormData): WebSearchConfigModel => {
        return {
            maxResults: parseInt(data.get('max_result_count') as string),
            timeout: parseInt(data.get('timeout') as string),
            maxLength: parseInt(data.get('max_length') as string),
        };
    },

    model: (configModel: LlmapiToolConfigModel): LlmapiToolModel => {
        const config: WebSearchConfigModel = configModel.value;

        return {
            name: 'webSearch',
            description: `Fetch content from web pages. Use when you need real-time information or content from specific URLs.${
                config.maxResults === 1
                    ? ' For single URL fetch.'
                    : ` Can fetch up to ${config.maxResults} URLs at once.`
            }`,
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
        };
    },

    invoke: async (
        {urls}: { urls: string[] },
        ctx: LlmapiToolContext
    ) => {
        const config: WebSearchConfigModel = ctx.config.value;

        const targetUrls = urls.slice(0, config.maxResults);

        const results = [];

        for (const url of targetUrls) {
            results.push(await fetchUrl(url, config.timeout * 1000, config.maxLength));
        }

        return joinAsString(results, "\r\n\r\n", u => `${u.url}\r\n${u.content ?? u.error}`);
    },
};

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

        console.debug("[web search](content type): ", contentType);
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
        console.warn("[web search]", error);
        return {
            url,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}