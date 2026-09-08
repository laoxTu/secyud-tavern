'use client';
import { useTranslations } from 'next-intl';

import {
  Field,
  FieldContent,
  FieldLabel,
  Orientation,
  RemoteSearchCombobox,
} from '@/components';
import { NameValue, utils } from '@/database';
import { useHandler } from '@/interceptors/client';
import { models, useModelSettingState } from '@/models/client';

interface ModelNameValueFieldProps {
  value?: NameValue | null;
  onValueChange?: (value: NameValue | null) => void;
  name?: string;
  orientation?: Orientation;
}

export function ModelNameValueField({
  name,
  orientation,
  value: defaultValue,
  onValueChange,
}: ModelNameValueFieldProps) {
  const t = useTranslations();
  const { model } = useModelSettingState();
  const { handler } = useHandler();
  return (
    <Field orientation={orientation}>
      <FieldLabel style={{ flex: 0 }} htmlFor={`${name}-model`}>
        {t('model.id')}
      </FieldLabel>
      <FieldContent className="flex-1">
        <RemoteSearchCombobox
          name={name}
          id={`${name}-model`}
          itemRender={(e) =>
            `${e.name} ${model?.value === e.value ? `(${t('model.default')})` : ``}`
          }
          onValueChange={onValueChange}
          value={defaultValue}
          fetcher={handler(async (request, search) => {
            const data = await models.proxy.list({
              ...request,
              search: { fuzzy: search },
            });
            return utils.mapData(data, models.toNameValue);
          })}
        />
      </FieldContent>
    </Field>
  );
}
