'use client';
import { CornerDownLeftIcon, DicesIcon, SquareStopIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { create } from 'zustand';

import { ComfyUIParamProps, ParamConfigurator } from '@/comfyui/client';
import {
  AgentTextConfig,
  editors as main,
  NumberConfig,
  PromptConfig,
  TextConfig,
} from '@/comfyui/editor';
import {
  Button,
  Field,
  FieldLabel,
  Input,
  MonacoEditor,
  rowQuat,
  Skeleton,
  spanHalf,
  submitTargetFormOnKey,
  Textarea,
} from '@/components';
import { forms } from '@/global';
import { checker } from '@/interceptors';
import { useHandler } from '@/interceptors/client';
import { cn } from '@/lib/utils';
import { realms } from '@/stories/client/realms';
import { agents, Editor } from '@/tools/agents/client';
import { ToolItem } from '@/tools/client';
import { jsonUtils } from '@/utils';

import { generatePrompt } from './generator';

function TextConfigComponent({
  param,
  formRef,
}: ComfyUIParamProps<TextConfig>) {
  const t = useTranslations();
  const config = jsonUtils.merge(main.text.default, param.config);
  const { sequence } = param;
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`param-node-${sequence}`}>
          {t('comfyui.param.node')}
        </FieldLabel>
        <Input
          name={'node'}
          defaultValue={config?.node}
          id={`param-node-${sequence}`}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`param-key-${sequence}`}>
          {t('comfyui.param.key')}
        </FieldLabel>
        <Input
          name={'key'}
          defaultValue={config?.key}
          id={`param-key-${sequence}`}
        />
      </Field>
      <TextInputComponent param={param} formRef={formRef} />
    </>
  );
}

function TextInputComponent({
  param: {
    name,
    sequence,
    config: { prompt },
  },
}: ComfyUIParamProps<TextConfig>) {
  return (
    <>
      <Field className={cn(spanHalf, rowQuat)}>
        <FieldLabel htmlFor={`param-text-${sequence}`}>{name}</FieldLabel>
        <Textarea
          id={`param-text-${sequence}`}
          name={`prompt_${sequence}`}
          onKeyDown={submitTargetFormOnKey}
          defaultValue={prompt}
        />
      </Field>
    </>
  );
}

export const text: ParamConfigurator<TextConfig> & {
  generate: typeof generatePrompt;
} = {
  id: main.text.name,
  generate: generatePrompt,
  configComponent: TextConfigComponent,
  async configureObject(data, param) {
    param.config = {
      node: forms.str(data, 'node'),
      key: forms.str(data, 'key'),
      prompt: forms.str(data, `prompt_${param.sequence}`),
    };
  },
  inputComponent: TextInputComponent,
  async configureInput(data, { config, sequence }, input) {
    const inputs = input[config.node]?.inputs;
    if (inputs) {
      inputs[config.key] = forms.str(data, `prompt_${sequence}`);
    }
  },
  async configureSchema(_, paint, schema) {
    schema.properties![paint.code] = {
      type: 'string',
      description: paint.description,
    };
  },
  async generateCalling({ config }, paint, input, args) {
    const inputs = input[config.node]?.inputs;
    if (inputs) {
      inputs[config.key] = args[paint.code] ?? config.prompt;
    }
  },
};

function PromptConfigComponent({
  param,
  formRef,
}: ComfyUIParamProps<PromptConfig>) {
  const t = useTranslations();
  const config = jsonUtils.merge(main.prompt.default, param.config);
  const { sequence } = param;
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`param-node-${sequence}`}>
          {t('comfyui.param.node')}
        </FieldLabel>
        <Input
          name={'node'}
          defaultValue={config?.node}
          id={`param-node-${sequence}`}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`param-key-${sequence}`}>
          {t('comfyui.param.key')}
        </FieldLabel>
        <Input
          name={'key'}
          defaultValue={config?.key}
          id={`param-key-${sequence}`}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`param-template-${sequence}`}>
          {t('comfyui.template.key')}
        </FieldLabel>
        <Textarea
          name={'template'}
          defaultValue={config?.template}
          id={`param-template-${sequence}`}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`param-pools-${sequence}`}>
          {t('comfyui.pools.key')}
        </FieldLabel>
        <MonacoEditor
          name={'pools'}
          value={config?.pools}
          language="json"
          formRef={formRef}
        />
      </Field>
    </>
  );
}

function PromptInputComponent({
  param: {
    name,
    sequence,
    config: { prompt, template, pools },
  },
}: ComfyUIParamProps<PromptConfig>) {
  const json = jsonUtils.parse(pools);
  const { handler } = useHandler();
  const [text, setText] = useState(prompt);
  return (
    <>
      <Field className={cn(spanHalf, rowQuat)}>
        <FieldLabel htmlFor={`param-text-${sequence}`}>
          {name}
          <Button
            onClick={handler(async () => {
              const text = generatePrompt(template, json);
              setText(text);
            })}
          >
            <DicesIcon />
          </Button>
        </FieldLabel>
        <Textarea
          id={`param-text-${sequence}`}
          name={`prompt_${sequence}`}
          onKeyDown={submitTargetFormOnKey}
          value={text}
          onChange={(u) => setText(u.target.value)}
        />
      </Field>
    </>
  );
}

export const prompt: ParamConfigurator<PromptConfig> = {
  id: main.text.name,
  configComponent: PromptConfigComponent,
  async configureObject(data, param) {
    param.config = {
      node: forms.str(data, 'node'),
      key: forms.str(data, 'key'),
      prompt: forms.str(data, `prompt_${param.sequence}`),
      template: forms.str(data, 'template'),
      pools: checker.validJson(forms.str(data, 'pools')),
    };
  },
  inputComponent: PromptInputComponent,
  async configureInput(data, { config, sequence }, input) {
    const inputs = input[config.node]?.inputs;
    if (inputs) {
      inputs[config.key] = forms.str(data, `prompt_${sequence}`);
    }
  },
  async configureSchema(_, paint, schema) {
    schema.properties![paint.code] = {
      type: 'string',
      description: paint.description,
    };
  },
  async generateCalling({ config }, paint, input, args) {
    const inputs = input[config.node]?.inputs;
    if (inputs) {
      inputs[config.key] =
        args[paint.code] ??
        generatePrompt(config.template, jsonUtils.parse(config.pools));
    }
  },
};

const cache: Record<string, ToolItem> = {};

interface AgentTextState {
  signal?: AbortController;
  setSignal: (signal?: AbortController, reason?: string) => void;
}

const useAgentTextState = create<AgentTextState>((set, get) => ({
  setSignal: (signal, reason) => {
    const origin = get().signal;
    if (origin) {
      origin.abort(reason ?? 'reset');
    }
    set({ signal });
  },
}));

function AgentTextConfigComponent({
  param,
  formRef,
}: ComfyUIParamProps<AgentTextConfig>) {
  return (
    <>
      <TextConfigComponent param={param} formRef={formRef} />
      <Editor
        formRef={formRef}
        entry={{
          masterId: '',
          entryId: -1,
          entryType: main.agentText.name,
          disabled: false,
          name: main.agentText.name,
          data: param,
        }}
      />
    </>
  );
}

function AgentTextInputComponent({
  param,
}: ComfyUIParamProps<AgentTextConfig>) {
  const t = useTranslations();
  const { sequence, config } = param;
  const { error, success } = useHandler();
  // 提示词，虽然用了text组件，但是真正起作用的改为了text
  const [prompt, setPrompt] = useState(config.prompt);
  // 真正的文字
  const [text, setText] = useState('');
  const [output, setOutput] = useState(false);
  const [thinking, setThinking] = useState(false);

  // 生成提示词
  const generate = async () => {
    try {
      setOutput(true);
      let tool = cache[param.masterId];
      if (!tool) {
        tool = (
          await agents.create(
            {
              ...param,
              signal: async (c?: AbortController | null) => {
                if (c) useAgentTextState.getState().setSignal(c);
              },
              output: async ({ text, title }) => {
                setText(text ?? '');
                setThinking(title === 'agent.thinking');
              },
            },
            realms.realm,
          )
        )[0];
        cache[param.masterId] = tool;
      }

      // 这里可以用宏占位，传入的是args，在宏处理阶段会附加
      await tool.invoke({ prompt });
      success(t('comfyui.param.agent_generated'));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('user abort reply');
        return; // 或者不处理
      }
      error(err);
    } finally {
      setOutput(false);
      setThinking(false);
    }
  };

  return (
    <>
      <Field className={spanHalf}>
        <FieldLabel
          htmlFor={`param-text-${sequence}`}
        >{`${param.name} ${t('comfyui.prompt')}`}</FieldLabel>
        <Textarea
          id={`param-text-${sequence}`}
          name={`prompt`}
          value={prompt}
          onKeyDown={submitTargetFormOnKey}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </Field>
      <Field className={spanHalf}>
        <FieldLabel htmlFor={`param-text-${sequence}`}>
          {param.name}
          {output ? (
            <Button
              disabled={false}
              onClick={(e) => {
                e.preventDefault();
                useAgentTextState
                  .getState()
                  .setSignal(undefined, 'user canceled.');
              }}
            >
              <SquareStopIcon />
            </Button>
          ) : (
            <Button onClick={generate}>
              <CornerDownLeftIcon />
            </Button>
          )}
          {thinking && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">{t('default.thinking')}</span>
              <Skeleton className="h-4 w-32" />
            </div>
          )}
        </FieldLabel>
        <Textarea
          id={`param-text-${sequence}`}
          name={`text_${sequence}`}
          value={text}
          onKeyDown={submitTargetFormOnKey}
          onChange={(e) => setText(e.target.value)}
        />
      </Field>
    </>
  );
}

export const agentText: ParamConfigurator<AgentTextConfig> = {
  id: main.agentText.name,
  configComponent: AgentTextConfigComponent,
  async configureObject(data, param) {
    const agent = { ...param };
    const texts = { ...param };
    await agents.tool.configureObject?.(data, agent);
    await text.configureObject?.(data, texts);
    param.config = {
      ...agent.config,
      ...texts.config,
    };
  },
  inputComponent: AgentTextInputComponent,
  async configureInput(data, { config, sequence }, input) {
    const inputs = input[config.node]?.inputs;
    if (inputs) {
      inputs[config.key] = forms.str(data, `text_${sequence}`);
    }
  },
  async configureSchema(_, paint, schema) {
    schema.properties![paint.code] = {
      type: 'string',
      description: paint.description,
    };
  },
  async generateCalling({ config }, paint, input, args) {
    const inputs = input[config.node]?.inputs;
    if (inputs && args[paint.code]) {
      inputs[config.key] = args[paint.code];
    }
  },
};

export function NumberConfigComponent({
  param,
  formRef,
}: ComfyUIParamProps<NumberConfig>) {
  const t = useTranslations();
  const config = jsonUtils.merge(main.number.default, param.config);
  const { sequence } = param;
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`param-node-${sequence}`}>
          {t('comfyui.param.node')}
        </FieldLabel>
        <Input
          name={'node'}
          defaultValue={config.node}
          id={`param-node-${sequence}`}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`param-key-${sequence}`}>
          {t('comfyui.param.key')}
        </FieldLabel>
        <Input
          name={'key'}
          defaultValue={config.key}
          id={`param-key-${sequence}`}
        />
      </Field>
      <NumberInputComponent param={param} formRef={formRef} />
    </>
  );
}

export function NumberInputComponent({
  param: { name, sequence, config },
}: ComfyUIParamProps<NumberConfig>) {
  // 受控，方便设置随机数
  const [value, setValue] = useState(config.value);
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`param-value-${sequence}`}>
          {name}
          <Button
            variant={'ghost'}
            size={'icon'}
            onClick={() => {
              setValue(Math.floor(Math.random() * 4294967296));
            }}
          >
            <DicesIcon />
          </Button>
        </FieldLabel>
        <Input
          id={`param-value-${sequence}`}
          name={`value_${sequence}`}
          type="number"
          value={value}
          onChange={(e) => {
            setValue(parseInt(e.target.value));
          }}
        />
      </Field>
    </>
  );
}

export const number: ParamConfigurator<NumberConfig> = {
  id: main.number.name,
  configComponent: NumberConfigComponent,
  async configureObject(data, param) {
    param.config = {
      node: forms.str(data, 'node'),
      key: forms.str(data, 'key'),
      value: forms.int(data, `value_${param.sequence}`),
    };
  },
  inputComponent: NumberInputComponent,
  async configureInput(data, { config, sequence }, input) {
    const inputs = input[config.node]?.inputs;
    if (inputs) {
      inputs[config.key] = forms.int(data, `value_${sequence}`);
    }
  },
  async configureSchema(_, paint, schema) {
    schema.properties![paint.code] = {
      type: 'number',
      description: paint.description,
    };
  },
  async generateCalling({ config }, paint, input, args) {
    const inputs = input[config.node]?.inputs;
    if (inputs) {
      inputs[config.key] = args[paint.code] ?? config.value;
    }
  },
};

export const editors = {
  ...main,
  configurator: {
    text,
    agentText,
    number,
    prompt,
  },
};
