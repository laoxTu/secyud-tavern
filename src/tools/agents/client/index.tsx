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
import { forms } from '@/global';
import { checker } from '@/interceptors';
import { cn } from '@/lib/utils';
import { ModelNameValueField, models } from '@/models/client';
import { PresetNameValuesField, presets } from '@/presets/client';
import { Realm, Story } from '@/stories';
import { stories } from '@/stories/client';
import { RealmInfo, realms, useRealmState } from '@/stories/realms/client';
import { Tool } from '@/tools';
import { AgentConfig } from '@/tools/agents';
import { ToolItem, ToolProps, ToolProvider } from '@/tools/client';
import { jsonUtils } from '@/utils';

import { agents as main } from '..';

const defaultConfig: AgentConfig = {
  disablePreset: false,
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
  // merge 是就地合并，先克隆默认值，避免渲染一次编辑器就污染模块级的 defaultConfig
  const config = jsonUtils.merge(structuredClone(defaultConfig), data.config);

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
          value={config.schema}
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
      <ModelNameValueField value={config.model} name={`model`} />
      <PresetNameValuesField value={config.presets ?? []} name={`preset`} />
      <Field className={spanHalf}>
        <FieldLabel htmlFor={`${entryId}-disable_tags`}>
          {t('agent.disable_tags')}
        </FieldLabel>
        <TagBox
          id={`${entryId}-disable_tags`}
          name={'disable_tags'}
          value={config.disableTags}
          items={presets.tags}
        />
      </Field>
    </>
  );
}

export type Output = (
  name: string,
  info: RealmInfo & { text?: string },
) => Promise<void>;

async function create(
  {
    config,
    output,
  }: Tool<AgentConfig> & {
    output?: Output;
  },
  { id, presets: parents, model, properties, entries, histories }: Realm,
) {
  // 子Agent禁止Agent调用
  if (properties?.agent) return [];
  const disableTags = new Set(config.disableTags);
  const story: Story = {
    id: main.name,
    name: main.name,
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
    changes: {},
  };
  await models.processers.initialize({ realm });

  if (!output) {
    const { setRealmInfo } = useRealmState.getState();
    output = async (name, info) => {
      setRealmInfo(name, info);
    };
  }
  return [agent(config, realm, output)];
}

const tool: ToolProvider<AgentConfig> = {
  id: main.name,
  configComponent: Editor,
  async configureObject(data, tool) {
    tool.config = {
      schema: checker.validJson(forms.str(data, 'schema'), 'default.schema'),
      disableTags: forms.strs(data, 'disable_tags'),
      presets: combobox.getAll(data, 'preset'),
      description: forms.str(data, 'description'),
      code: forms.str(data, 'code'),
      disablePreset: forms.bool(data, 'disable_preset'),
      model: combobox.get(data, 'model'),
    };
  },
  create,
};

export const agents = {
  ...main,
  default: defaultConfig,
  tool,
  create,
};

function agent(config: AgentConfig, realm: Realm, info: Output): ToolItem {
  return {
    name: config.code,
    description: config.description ?? '',
    parameters: jsonUtils.parse(config.schema),
    async invoke({ args, toolcall, controller }) {
      let result: string = 'error: empty content';
      // 只用前面已经完结的历史
      // 主agent可能已经设置了工具调用
      const histories = [...realm.histories];
      if (histories.length) {
        const index = histories.length - 1;
        const history = histories[index];
        if (history) {
          // 工作区 Agent 共用当前工作区，只有输出列表不引用
          // 同时最后一个输出的也剔除，这样子Agent也可以操作
          // 工作区以及历史的属性
          const space = realms.space(history)!;
          space.properties ??= {};
          const clone = {
            ...history,
            index: 0,
            spaces: [{ ...space, outputs: space.outputs.slice(0, -1) }],
          };
          histories[index] = clone;
        }
      }

      let thoughtLen = 0;
      let toolArgLen = 0;
      for await (const { output } of models.processers.generate({
        controller,
        args,
        realm: {
          ...realm,
          histories,
        },
      })) {
        result = output.content;
        if (!toolcall) continue;

        const curThoughtLen = output.thought.length;
        const curToolArgLen =
          output.callings?.reduce((u, c) => u + c.arguments.length, 0) ?? 0;
        if (curThoughtLen !== thoughtLen) {
          thoughtLen = curThoughtLen;
          await info(toolcall.id, {
            content: `${thoughtLen}`,
            title: 'agent.thinking',
            text: output.content,
          });
        } else if (curToolArgLen !== toolArgLen) {
          toolArgLen = curToolArgLen;
          await info(toolcall.id, {
            content: `${toolArgLen}`,
            title: 'agent.generating_tool',
            text: output.content,
          });
        } else {
          await info(toolcall.id, {
            content: `${output.content.length}`,
            title: 'agent.generating',
            text: output.content,
          });
        }
      }

      return result;
    },
  };
}
