import {Editor} from "./editor";
import {WebSearchConfigModel} from "../models";
import {Readability} from "@mozilla/readability";
import {LlmapiTool, LlmapiToolContext} from "@/engines/tools/client/models";
import {LlmapiToolConfigModel} from "@/engines/tools/models";
import {LlmapiToolModel} from "@/modules/slots/models";


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

        return results;
    },
};

// ============ 简化版抓取 ============

async function fetchUrl(url: string, timeout: number, maxLength: number): Promise<{
    success: boolean;
    content?: string | null;
    error?: string
}> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) return {success: false, error: `HTTP ${response.status}`};

        // 检测流式，直接终止
        const contentType = response.headers.get('content-type') || '';
        const transferEncoding = response.headers.get('transfer-encoding');
        if (
            contentType.includes('text/event-stream') ||
            contentType.includes('application/octet-stream') ||
            transferEncoding === 'chunked'
        ) {
            controller.abort();
            return {success: false, error: 'Streaming response not supported'};
        }

        let content: string | null | undefined = await response.text();

        if (
            // json
            contentType.includes('application/json') ||
            // xml
            contentType.includes('text/xml')
        ) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            // 2. 创建 Readability 实例，传入 document 对象
            const reader = new Readability(doc);
            // 3. 解析文章
            const article = reader.parse();
            content = article?.textContent;
        }

        return {success: true, content: content?.substring(0, maxLength)};
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            return {success: false, error: 'Request timeout'};
        }
        console.warn("[web search]", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}