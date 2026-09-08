'use client';
import { useTranslations } from 'next-intl';

import {
  Checkbox,
  Field,
  FieldContent,
  FieldLabel,
  Input,
  MonacoEditor,
  rowFull,
  rowQuat,
  spanHalf,
  submitTargetFormOnKey,
  Textarea,
} from '@/components';
import { checker } from '@/interceptors';
import { cn } from '@/lib/utils';
import { Realm } from '@/stories';
import { realms } from '@/stories/client/realms';
import { ToolItem, ToolProps, ToolProvider } from '@/tools/client';
import { ScriptConfig } from '@/tools/scripts';
import { jsonUtils } from '@/utils';

const defaultConfig: ScriptConfig = {
  code: '',
  description: '',
  script: 'return input;',
  hidden: false,
  enableDoc: false,
  schema: `{
    "type": "object",
    "additionalProperties": false
}`,
};

export function Editor({
  entry: { entryId, data },
  formRef,
}: ToolProps<ScriptConfig>) {
  const t = useTranslations();
  const config = jsonUtils.merge(defaultConfig, data.config);

  return (
    <>
      <Field className={cn(spanHalf, rowQuat)}>
        <FieldLabel htmlFor={`${entryId}-description`}>
          {t('default.description')}
        </FieldLabel>
        <Textarea
          name="description"
          id={`${entryId}-description`}
          defaultValue={config.description}
          onKeyDown={submitTargetFormOnKey}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${entryId}-hidden`}>
          {t('default.hidden')}
        </FieldLabel>
        <FieldContent>
          <Checkbox
            name="hidden"
            id={`${entryId}-hidden`}
            defaultChecked={config.hidden}
          />
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${entryId}-enable_doc`}>
          {t('script.enable_doc')}
        </FieldLabel>
        <FieldContent>
          <Checkbox
            name="enable_doc"
            id={`${entryId}-enable_doc`}
            defaultChecked={config.enableDoc ?? false}
          />
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${entryId}-enable_variable`}>
          {t('script.enable_variable')}
        </FieldLabel>
        <FieldContent>
          <Checkbox
            name="enable_variable"
            id={`${entryId}-enable_variable`}
            defaultChecked={config.enableVariable ?? false}
          />
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${entryId}-code`}>{t('default.code')}</FieldLabel>
        <FieldContent>
          <Input
            name="code"
            pattern={checker.code}
            id={`${entryId}-code`}
            defaultValue={config.code}
          />
        </FieldContent>
      </Field>
      <Field className={cn(spanHalf, rowFull)}>
        <FieldLabel htmlFor={`${entryId}-script`}>
          {t('default.script')}
        </FieldLabel>
        <MonacoEditor
          name={'script'}
          value={config.script}
          language={'javascript'}
          formRef={formRef}
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
    </>
  );
}

const tool: ToolProvider<ScriptConfig> = {
  id: 'script',
  configComponent: Editor,
  async configureObject(data, tool) {
    tool.config = {
      hidden: !!data.get('hidden'),
      enableDoc: !!data.get('enable_doc'),
      enableVariable: !!data.get('enable_variable'),
      script: data.get('script') as string,
      code: data.get('code') as string,
      schema: checker.validJson(data.get('schema') as string, 'default.schema'),
      description: data.get('description') as string,
    };
  },
  async create(tool, realm) {
    return [script(tool.config, realm)];
  },
};
export const scripts = {
  name: 'script',
  default: defaultConfig,
  tool,
};

function script(config: ScriptConfig, realm: Realm): ToolItem {
  const fn = new Function('input', 'context', config.script);
  return {
    name: config.code,
    description: config.description,
    parameters: JSON.parse(config.schema || '{}'),
    async invoke(args: any) {
      const context: any = {};
      if (config.enableDoc) {
        const { contentDocument = null, contentWindow = null } =
          realms.iframe ?? {};
        context.document = contentDocument;
        context.window = contentWindow;
      }
      if (config.enableVariable) {
        const history = await realms.history.get(null, realm);
        context.variables = history.variables;
      }
      const result = fn(args, context);
      return typeof result === 'string' ? result : JSON.stringify(result);
    },
  };
}
