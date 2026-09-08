'use client';
import { useTranslations } from 'next-intl';

import {
  Checkbox,
  combobox,
  Field,
  FieldContent,
  FieldLabel,
  Input,
  MonacoEditor,
  rowFull,
  rowQuat,
  spanHalf,
  submitTargetFormOnKey,
  TagBox,
  Textarea,
} from '@/components';
import { checker } from '@/interceptors';
import { cn } from '@/lib/utils';
import { ModelNameValueField, models } from '@/models/client';
import { PresetNameValuesField, presets } from '@/presets/client';
import { SignalBinder } from '@/signal';
import { Realm, Story } from '@/stories';
import { stories } from '@/stories/client';
import { RealmInfo, useRealmState } from '@/stories/client/realms';
import { Tool } from '@/tools';
import { AgentConfig } from '@/tools/agents';
import { ToolItem, ToolProps, ToolProvider } from '@/tools/client';
import { jsonUtils } from '@/utils';

const defaultConfig: AgentConfig = {
  disablePreset: false,
  maxLength: 0,
  code: '',
  description: '',
  disableTags: [],
  model: null,
  presets: [],
  schema: JSON.stringify(
    {
      type: 'object',
      additionalProperties: false,
    },
    null,
    2,
  ),
};

export function Editor({
  entry: { entryId, data },
  formRef,
}: ToolProps<AgentConfig>) {
  const t = useTranslations();
  const config = jsonUtils.merge(defaultConfig, data.config);

  return (
    <>
      <Field>
        <FieldLabel htmlFor={`${entryId}-code`}>{t('default.code')}</FieldLabel>
        <Input
          id={`${entryId}-code`}
          name={'code'}
          pattern={checker.code}
          defaultValue={config.code}
        />
      </Field>
      <Field className={cn(spanHalf, rowQuat)}>
        <FieldLabel htmlFor={`${entryId}-description`}>
          {t('default.description')}
        </FieldLabel>
        <Textarea
          id={`${entryId}-description`}
          name={'description'}
          defaultValue={config.description}
          onKeyDown={submitTargetFormOnKey}
        />
      </Field>
      <Field className={cn(spanHalf, rowFull)}>
        <FieldLabel htmlFor={`${entryId}-schema`}>
          {t('default.schema')}
        </FieldLabel>
        <MonacoEditor
          name={'schema'}
          defaultValue={config.schema}
          language={'json'}
          formRef={formRef}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${entryId}-disable_preset`}>
          {t('agent.disable_preset')}
        </FieldLabel>
        <FieldContent>
          <Checkbox
            id={`${entryId}-disable_preset`}
            name={'disable_preset'}
            defaultChecked={config.disablePreset}
          />
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${entryId}-max_length`}>
          {t('agent.max_length')}
        </FieldLabel>
        <FieldContent>
          <Input
            id={`${entryId}-max_length`}
            name={'max_length'}
            min={0}
            step={1}
            defaultValue={config.maxLength}
          />
        </FieldContent>
      </Field>
      <ModelNameValueField defaultValue={config.model} name={`model`} />
      <PresetNameValuesField
        defaultValue={config.presets ?? []}
        name={`preset`}
      />
      <Field className={spanHalf}>
        <FieldLabel htmlFor={`${entryId}-disable_tags`}>
          {t('agent.disable_tags')}
        </FieldLabel>
        <TagBox
          id={`${entryId}-disable_tags`}
          name={'disable_tags'}
          defaultValue={config.disableTags}
          items={presets.tags}
        />
      </Field>
    </>
  );
}

async function create(
  {
    config,
    signal,
    output,
  }: Tool<AgentConfig> & {
    signal?: SignalBinder;
    output?: (info: RealmInfo & { text?: string }) => Promise<void>;
  },
  { id, presets: parents, model, properties, entries, histories }: Realm,
) {
  // 子Agent禁止Agent调用
  if (properties?.agent) return [];
  const disableTags = new Set(config.disableTags);
  const story: Story = {
    id: 'agent',
    name: 'agent',
    presets: [
      ...(config.presets ?? []),
      ...(config.disablePreset ? [] : parents.map(presets.toNameValue)),
    ],
    model: config.model ?? models.toNameValue(model),
    properties,
  };
  const result = await stories.proxy.realm.get(story);
  const realm: Realm = {
    ...result,
    id: id,
    get histories() {
      return histories;
    },
    entries,
    presets: result.presets.filter((u) =>
      u.tags.every((v) => !disableTags.has(v)),
    ),
    properties: {
      agent: 1,
    },
  };
  await models.processers.initialize({ realm });
  signal ??= async (signal?: AbortController | null) => {
    if (signal) {
      useRealmState.getState().setAbort(() => {
        console.debug('[sub-agent]: abort');
        signal.abort('user cancelled');
      });
    }
  };

  if (!output) {
    const { setRealmInfo } = useRealmState.getState();
    output = async (info) => {
      setRealmInfo(info);
    };
  }
  return [agent(config, realm, signal, output)];
}

const tool: ToolProvider<AgentConfig> = {
  id: 'agent',
  configComponent: Editor,
  async configureObject(data, tool) {
    tool.config = {
      schema: checker.validJson(data.get('schema') as string, 'default.schema'),
      disableTags: data.getAll('disable_tags').map((u) => String(u)),
      presets: combobox.getAll(data, 'preset'),
      description: data.get('description') as string,
      code: data.get('code') as string,
      disablePreset: !!data.get('disable_preset'),
      maxLength: parseInt(data.get('max_length') as string),
      model: combobox.get(data, 'model'),
    };
  },
  create,
};

export const agents = {
  name: 'agent',
  default: defaultConfig,
  tool,
  create,
};

function agent(
  config: AgentConfig,
  realm: Realm,
  signal: SignalBinder,
  info: (info: RealmInfo & { text?: string }) => Promise<void>,
): ToolItem {
  return {
    name: config.code,
    description: config.description,
    parameters: jsonUtils.parse(config.schema),
    async invoke(args: any) {
      let result: string = 'error: empty content';
      // 深拷贝待解析副本，防止不必要的变化，例如工具冲突。
      // 主agent可能已经设置了工具调用
      const histories = structuredClone(
        realm.histories.slice(-config.maxLength),
      );
      if (!histories.length) {
        histories.push({
          masterId: realm.id,
          output: 0,
          sequence: 0,
          prompts: [],
          outputs: [],
          summary: false,
          variables: {},
        });
      }
      const history = histories.at(-1)!;
      history.outputs = [];
      history.output = -1;
      let thoughtLen = 0;
      let toolArgLen = 0;
      for await (const { output } of models.processers.generate({
        signal,
        args,
        realm: {
          ...realm,
          histories,
        },
      })) {
        const curThoughtLen = output.thought.length;
        const curToolArgLen =
          output.callings?.reduce((u, c) => u + c.arguments.length, 0) ?? 0;
        if (curThoughtLen !== thoughtLen) {
          thoughtLen = curThoughtLen;
          await info({
            content: `${thoughtLen}`,
            title: 'agent.thinking',
            text: output.content,
          });
        } else if (curToolArgLen !== toolArgLen) {
          toolArgLen = curToolArgLen;
          await info({
            content: `${toolArgLen}`,
            title: 'agent.generating_tool',
            text: output.content,
          });
        } else {
          await info({
            content: `${output.content.length}`,
            title: 'agent.generating',
            text: output.content,
          });
        }
        result = output.content;
      }

      return result;
    },
  };
}
