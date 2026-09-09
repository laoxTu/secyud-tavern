import { BookIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  Checkbox,
  element,
  Field,
  FieldContent,
  FieldLabel,
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
  } = useRagState();
  const { success, handler } = useHandler();
  const [editor, setEditor] = useState(rags.registry.record(type));

  return (
    <UpdateForm
      onSubmit={handler(async (data: FormData) => {
        useRagState.setState({
          disabled: !!data.get('disabled'),
          embedder: editor
            ? {
                type: editor.id,
                config: editor.configure(data),
              }
            : rags.default,
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
