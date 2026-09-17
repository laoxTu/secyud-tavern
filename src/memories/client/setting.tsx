import { BookIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  Checkbox,
  element,
  Field,
  FieldContent,
  FieldLabel,
  forms,
  Input,
  Selector,
  UpdateForm,
} from '@/components';
import { SettingTab } from '@/global/client';
import { useHandler } from '@/interceptors/client';

import { rags, useRagState } from './rag';

function Setting() {
  const t = useTranslations();
  const {
    disabled,
    embedder: { type },
    limit,
    similarity,
    cacheLimit,
  } = useRagState();
  const { success, handler } = useHandler();
  const [editor, setEditor] = useState(rags.registry.record(type));

  return (
    <UpdateForm
      onSubmit={handler(async (data: FormData) => {
        useRagState.setState({
          disabled: forms.bool(data, 'disabled'),
          embedder: editor
            ? {
                type: editor.id,
                config: editor.configure(data),
              }
            : rags.default,
          limit: forms.int(data, 'limit'),
          similarity: forms.float(data, 'similarity'),
          cacheLimit: forms.int(data, 'cache_limit'),
        });
        success(t('message.update.success'));
      })}
    >
      <Field>
        <FieldLabel htmlFor="setting-rag-disabled">
          {t('default.disable')}
        </FieldLabel>
        <FieldContent>
          <Checkbox
            id={'setting-rag-disabled'}
            name="disabled"
            defaultChecked={disabled}
          />
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor="setting-rag-limit">{t('rag.limit')}</FieldLabel>
        <FieldContent>
          <Input
            type="number"
            id={'setting-rag-limit'}
            name="limit"
            max={50}
            min={1}
            step={1}
            defaultValue={limit}
          />
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor="setting-rag-similarity">
          {t('rag.similarity')}
        </FieldLabel>
        <FieldContent>
          <Input
            type="number"
            id={'setting-rag-similarity'}
            max={1}
            step={0.01}
            min={0}
            name="similarity"
            defaultValue={similarity}
          />
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor="setting-rag-cache_limit">
          {t('rag.cache_limit')}
        </FieldLabel>
        <FieldContent>
          <Input
            type="number"
            min={10000}
            id={'setting-rag-cache_limit'}
            name="cache_limit"
            defaultValue={cacheLimit}
          />
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor="setting-generator">
          {t('rag.embedding_generator')}
        </FieldLabel>
        <Selector
          id={`setting-generator`}
          items={rags.registry.sorted()}
          name="generator"
          value={editor}
          onValueChange={setEditor}
          labelAccessor={(e) => e.id}
          valueAccessor={(e) => e.id}
        />
      </Field>
      {element(editor?.component)}
    </UpdateForm>
  );
}

export const setting: SettingTab = {
  id: rags.name,
  content: Setting,
  icon: BookIcon,
  label: 'rag.id',
};
