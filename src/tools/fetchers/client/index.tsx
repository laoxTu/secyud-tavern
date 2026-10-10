'use client';

import { Readability } from '@mozilla/readability';
import { useTranslations } from 'next-intl';

import { post } from '@/client';
import { Field, FieldContent, FieldLabel, Input } from '@/components';
import { forms } from '@/global';
import { signals } from '@/signal';
import { ToolItem, ToolProps, ToolProvider } from '@/tools/client';
import { arrUtils, jsonUtils } from '@/utils';

import { FetchConfig, fetchers as main } from '..';

const defaultConfig: FetchConfig = {
  maxResults: 3,
  timeout: 10,
  maxLength: 8000,
};

export function Editor({ entry: { entryId, data } }: ToolProps<FetchConfig>) {
  const t = useTranslations();
  // merge 是就地合并，先克隆默认值，避免渲染一次编辑器就污染模块级的 defaultConfig
  const config = jsonUtils.merge(structuredClone(defaultConfig), data.config);

  return (
    <>
      <Field>
        <FieldLabel htmlFor={`${entryId}-maxResults`}>
          {t('fetcher.max_results')}
        </FieldLabel>
        <Input
          id={`${entryId}-maxResults`}
          defaultValue={config.maxResults ?? 1}
          name="max_result_count"
          type="number"
          min={1}
          max={5}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor={`${entryId}-timeout`}>
          {t('fetcher.timeout')}
        </FieldLabel>
        <FieldContent className={'flex-row'}>
          <Input
            id={`${entryId}-timeout`}
            name="timeout"
            defaultValue={config.timeout ?? 5}
            min={3}
            max={30}
            step={1}
          />
          <span className="m-auto text-muted-foreground">s</span>
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor={`${entryId}-max_length`}>
          {t('fetcher.max_length')}
        </FieldLabel>
        <Input
          id={`${entryId}-max_length`}
          name="max_length"
          defaultValue={config.maxLength ?? 8000}
          min={3}
          max={30}
          step={1}
        />
      </Field>
    </>
  );
}

export const fetchers: ToolProvider<FetchConfig> = {
  id: main.name,
  configComponent: Editor,
  async configureObject(data, tool) {
    tool.config = {
      maxResults: forms.int(data, 'max_result_count'),
      timeout: forms.int(data, 'timeout'),
      maxLength: forms.int(data, 'max_length'),
    };
  },
  async create(entry) {
    return [fetcher(entry.config)];
  },
};

function fetcher(config: FetchConfig): ToolItem<{ urls: string[] }> {
  return {
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
    async invoke({ args: { urls }, controller }) {
      const targetUrls = urls.slice(0, config.maxResults);

      const results = [];

      for (const url of targetUrls) {
        results.push(
          await fetchUrl(
            url,
            controller.signal,
            config.timeout * 1000,
            config.maxLength,
          ),
        );
      }

      return arrUtils.join(
        results,
        '\n',
        // content 与 error 都为空时兜底成明确文案，避免拼出字面量 undefined
        (u) => `${u.url}\r\n${u.content ?? u.error ?? 'no content'}`,
      );
    },
  };
}

// ============ 简化版抓取 ============
async function fetchUrl(
  url: string,
  signal: AbortSignal,
  timeout: number,
  maxLength: number,
) {
  const { controller, destroy } = signals.createSub(signal);
  try {
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // eslint-disable-next-line prefer-const
    let {
      content,
      contentType,
    }: {
      content: string | null | undefined;
      contentType: string;
    } = await post(
      'proxy',
      { url },
      {
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    console.debug('[url fetch](content type): ', contentType);
    if (
      // html
      contentType.includes('html') ||
      // xml
      contentType.includes('xml')
    ) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content ?? '', 'text/html');
      // 2. 创建 Readability 实例，传入 document 对象
      const reader = new Readability(doc);
      // 3. 解析文章
      const article = reader.parse();
      content = article?.textContent;
    }

    return { url, success: true, content: content?.substring(0, maxLength) };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { url, success: false, error: 'Request timeout' };
    }
    console.warn('[url fetch]', error);
    return {
      url,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    destroy();
  }
}
