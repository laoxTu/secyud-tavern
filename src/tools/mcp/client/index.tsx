'use client';
import { useTranslations } from 'next-intl';

import {
  Field,
  FieldContent,
  FieldLabel,
  Input,
  rowQuat,
  spanHalf,
  submitTargetFormOnKey,
  Textarea,
} from '@/components';
import { forms } from '@/global';
import { BusinessError, checker } from '@/interceptors';
import { cn } from '@/lib/utils';
import { ToolItem, ToolProps, ToolProvider } from '@/tools/client';
import { JsonSchema, jsonUtils } from '@/utils';

import { mcp as main, McpConfig } from '..';

import { McpClient, McpToolDefinition } from './protocol';

export function Editor({ entry: { entryId, data } }: ToolProps<McpConfig>) {
  const t = useTranslations();
  // merge 是就地合并，先克隆默认值，避免渲染一次编辑器就污染模块级的默认配置
  const config = jsonUtils.merge(structuredClone(main.default), data.config);

  return (
    <>
      <Field className={cn(spanHalf, rowQuat)}>
        <FieldLabel htmlFor={`${entryId}-code`}>{t('default.code')}</FieldLabel>
        <FieldContent>
          <Input
            id={`${entryId}-code`}
            name={'code'}
            pattern={checker.code}
            defaultValue={config.code}
          />
        </FieldContent>
      </Field>
      <Field className={cn(spanHalf, rowQuat)}>
        <FieldLabel htmlFor={`${entryId}-url`}>{t('mcp.url')}</FieldLabel>
        <FieldContent>
          <Input id={`${entryId}-url`} name={'url'} defaultValue={config.url} />
        </FieldContent>
      </Field>
      <Field className={cn(spanHalf, rowQuat)}>
        <FieldLabel htmlFor={`${entryId}-timeout`}>
          {t('mcp.timeout')}
        </FieldLabel>
        <FieldContent>
          <Input
            id={`${entryId}-timeout`}
            name={'timeout'}
            type={'number'}
            min={1}
            max={300}
            defaultValue={config.timeout}
          />
        </FieldContent>
      </Field>
      <Field className={cn(spanHalf, rowQuat)}>
        <FieldLabel htmlFor={`${entryId}-max_length`}>
          {t('mcp.max_length')}
        </FieldLabel>
        <FieldContent>
          <Input
            id={`${entryId}-max_length`}
            name={'max_length'}
            type={'number'}
            min={100}
            defaultValue={config.maxLength}
          />
        </FieldContent>
      </Field>
      <Field className={cn(spanHalf, rowQuat)}>
        <FieldLabel htmlFor={`${entryId}-headers`}>
          {t('mcp.headers')}
        </FieldLabel>
        <Textarea
          name={'headers'}
          id={`${entryId}-headers`}
          defaultValue={JSON.stringify(config.headers, null, 2)}
          onKeyDown={submitTargetFormOnKey}
        />
      </Field>
      <Field className={cn(spanHalf, rowQuat)}>
        <FieldLabel htmlFor={`${entryId}-includes`}>
          {t('mcp.includes')}
        </FieldLabel>
        <Textarea
          name={'includes'}
          id={`${entryId}-includes`}
          defaultValue={config.includes.join('\n')}
          onKeyDown={submitTargetFormOnKey}
        />
      </Field>
    </>
  );
}

/**
 * 请求头在表单里是一段 json 文本。
 * 这里要报错而不是静默丢掉：写错一个引号就全都鉴权失败，很难查。
 */
function parseHeaders(text?: string | null): Record<string, string> {
  const value = jsonUtils.parse(
    checker.validJsonOrEmpty(text, 'mcp.headers'),
    {},
  );
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BusinessError(
      `headers must be a json object`,
      'error.json_invalid',
    ).withValue('target', 'mcp.headers');
  }
  return value;
}

/** 工具名列表，逗号、空格、换行都能分隔 */
function parseIncludes(text?: string | null): string[] {
  return (text ?? '').split(/[\s,]+/).filter((u) => u);
}

const tool: ToolProvider<McpConfig> = {
  id: main.name,
  configComponent: Editor,
  async configureObject(data, tool) {
    tool.config = {
      code: forms.str(data, 'code'),
      url: forms.str(data, 'url'),
      headers: parseHeaders(forms.str(data, 'headers')),
      includes: parseIncludes(forms.str(data, 'includes')),
      timeout: forms.int(data, 'timeout'),
      maxLength: forms.int(data, 'max_length'),
    };
  },
  async create(entry) {
    const config = jsonUtils.merge(structuredClone(main.default), entry.config);
    const client = new McpClient(config);
    try {
      // 工具列表只能在加载预设时拉一次，服务器连不上就当这个条目没有工具。
      // 这里不抛错：一个服务器挂了不该让整个故事加载失败。
      const definitions = await client.listTools(new AbortController().signal);
      return definitions
        .filter(
          (u) => !config.includes.length || config.includes.includes(u.name),
        )
        .map((u) => mcpTool(config, u, client));
    } catch (error) {
      console.warn(`[mcp](create failed): ${config.url}`, error);
      return [];
    }
  },
};

export const mcp = {
  ...main,
  tool,
};

function mcpTool(
  config: McpConfig,
  definition: McpToolDefinition,
  client: McpClient,
): ToolItem {
  return {
    name: config.code ? `${config.code}_${definition.name}` : definition.name,
    description: definition.description ?? '',
    parameters: (definition.inputSchema ?? {
      type: 'object',
      additionalProperties: false,
    }) as JsonSchema,
    async invoke({ args, controller }) {
      const result = await client.callTool(
        definition.name,
        args,
        controller.signal,
      );
      // 结果超长就截断，避免一次调用把上下文塞满
      return config.maxLength > 0 && result.length > config.maxLength
        ? result.substring(0, config.maxLength)
        : result;
    },
  };
}
