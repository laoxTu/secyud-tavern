'use client';
import {
  DownloadIcon,
  FileDownIcon,
  SearchIcon,
  SquarePenIcon,
  SquarePlusIcon,
  XIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { ComfyUIModel } from '@/comfyui';
import { civitais } from '@/comfyui/civitai/client';
import { ComfyUIModelHoverableItem, comfyuis } from '@/comfyui/client';
import { useComfyUIModelState } from '@/comfyui/client/state';
import {
  AspectRatio,
  Badge,
  DeleteDialog,
  dialogs,
  element,
  Field,
  FieldGroup,
  FieldLabel,
  IconTooltip,
  ImageUploader,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Item,
  ItemActions,
  ItemContent,
  ItemHeader,
  ItemTitle,
  LinkTooltip,
  MonacoEditor,
  PagedItemList,
  Selector,
  TagBox,
  TooltipDialog,
  useImageUploaderState,
} from '@/components';
import { files } from '@/files/client';
import { BusinessError } from '@/interceptors';
import { useHandler } from '@/interceptors/client';

function ContentItem({ item: nameValueItem }: { item: ComfyUIModel }) {
  const { handler, success } = useHandler();
  const t = useTranslations();
  const { getImageFileId, onFileChange } = useImageUploaderState('cover');
  const { fetch } = useComfyUIModelState();
  const [item, setItem] = useState<ComfyUIModel>(nameValueItem);
  const formRef = useRef<HTMLFormElement>(null);

  const source = files.proxy.url(item.cover);
  return (
    <Item
      variant={'outline'}
      className={'min-w-1/5 w-64 overflow-hidden relative sc-dc'}
    >
      <ItemHeader>
        <ComfyUIModelHoverableItem
          id={item.id}
          path={item.path}
          setItem={setItem}
        >
          {(item) => (
            <AspectRatio ratio={1}>
              {source.endsWith('mp4') ? (
                <video
                  src={source}
                  controls
                  preload="metadata"
                  className="object-cover aspect-square"
                />
              ) : (
                <Image
                  src={source}
                  alt={item.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              )}
            </AspectRatio>
          )}
        </ComfyUIModelHoverableItem>
      </ItemHeader>
      <ItemContent>
        <ItemTitle>{item.name}</ItemTitle>
      </ItemContent>
      <div className={'absolute top-3 left-3.5 flex flex-col gap-2'}>
        <Badge variant="secondary">{item.type}</Badge>
        <Badge variant="secondary">{item.model}</Badge>
      </div>
      <ItemActions
        className={`absolute top-1 right-1 bg-background sc-dc-flex`}
      >
        {item.url && <LinkTooltip href={item.url} />}

        {item.download && (
          <IconTooltip
            onClick={handler(async () => {
              await comfyuis.proxy.model.download(item.id);
              success(t('comfyui.download_started'));
            })}
            text={'comfyui.download_server'}
          >
            <DownloadIcon />
          </IconTooltip>
        )}
        <DeleteDialog
          onDelete={handler(async () => {
            await comfyuis.proxy.model.delete(item.id);
            success(t('default.delete_successfully'));
            await fetch();
          })}
          itemName={`comfyui.model.id`}
        />
        <TooltipDialog
          className={'flex flex-col overflow-hidden'}
          style={{ maxWidth: '86%', height: '86%' }}
          tooltip={<SquarePenIcon />}
          onSubmit={handler(async (data: FormData) => {
            const id = await getImageFileId(data);
            const cover = id ? id : (data.get('cover_src') as string);

            await comfyuis.proxy.model.update(item.id, {
              code: item.code,
              name: data.get('name') as string,
              type: data.get('type') as string,
              path: data.get('path') as string,
              url: data.get('url') as string,
              html: data.get('html') as string,
              download: data.get('download') as string,
              model: data.get('model') as string,
              cover,
            });

            success(t('message.update.success'));
            await fetch();
          })}
          info={dialogs.info(t, 'update', 'comfyui.model.id')}
        >
          <FieldGroup className={'overflow-auto p-2 flex-1'}>
            <Field>
              <FieldLabel htmlFor={`comfyui_model-cover-${item.id}`}>
                {t('default.cover')}
              </FieldLabel>
              <ImageUploader
                name={'cover'}
                id={`comfyui_model-cover-${item.id}`}
                className={'max-w-52'}
                accept={'image/png'}
                value={source}
                onChange={onFileChange}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`comfyui_model-cover_src-${item.id}`}>
                {t('default.cover_src')}
              </FieldLabel>
              <Input
                id={`comfyui_model-cover_src-${item.id}`}
                defaultValue={item.cover}
                name="cover_src"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`comfyui_model-code-${item.id}`}>
                {t('default.code')}
              </FieldLabel>
              <Input
                id={`comfyui_model-code-${item.id}`}
                defaultValue={item.code}
                name="code"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`comfyui_model-name-${item.id}`}>
                {t('default.name')}
              </FieldLabel>
              <Input
                id={`comfyui_model-name-${item.id}`}
                defaultValue={item.name}
                name="name"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`comfyui_model-type-${item.id}`}>
                {t('default.type')}
              </FieldLabel>
              <Selector
                name={'type'}
                id={`comfyui_model-type-${item.id}`}
                value={item.type}
                items={comfyuis.model.types}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`comfyui_model-path-${item.id}`}>
                {t('comfyui.model_path')}
              </FieldLabel>
              <Input
                id={`comfyui_model-path-${item.id}`}
                defaultValue={item.path}
                name="path"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`comfyui_model-url-${item.id}`}>
                {t('default.url')}
              </FieldLabel>
              <Input
                id={`comfyui_model-url-${item.id}`}
                defaultValue={item.url}
                name="url"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`comfyui_model-download-${item.id}`}>
                {t('comfyui.download_url')}
              </FieldLabel>
              <Input
                id={`comfyui_model-download-${item.id}`}
                defaultValue={item.download}
                name="download"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`comfyui_model-model-${item.id}`}>
                {t('comfyui.base_model')}
              </FieldLabel>
              <Input
                id={`comfyui_model-model-${item.id}`}
                defaultValue={item.model}
                name="model"
              />
            </Field>
            <Field>
              <FieldLabel>{t('default.html')}</FieldLabel>
              <MonacoEditor
                name={'html'}
                value={item.html ?? ''}
                language={'html'}
                formRef={formRef}
              />
            </Field>
          </FieldGroup>
        </TooltipDialog>
      </ItemActions>
    </Item>
  );
}

export function ModelContent() {
  const t = useTranslations();
  const { handler, success } = useHandler();
  const { fetch, search } = useComfyUIModelState();
  // 受控组件，解决搜索刷新后光标位置问题
  const [fuzzy, setFuzzy] = useState(search?.fuzzy ?? '');
  const [importer, setImporter] = useState(
    comfyuis.importers.registry.record(civitais.name),
  );

  return (
    <div className={'h-full flex-1 flex flex-col'}>
      <div className={'flex flex-wrap'}>
        <form
          className={'flex-1 flex flex-wrap'}
          action={handler(async (data: FormData) => {
            await fetch({
              search: () => ({
                types: data.getAll('type') as string[],
                fuzzy: data.get('search') as string,
              }),
            });
          })}
        >
          <TagBox
            value={[]}
            name={'type'}
            className={'min-w-48'}
            placeholder={t('default.types')}
            items={comfyuis.model.types}
          />
          <InputGroup>
            <InputGroupInput
              name="search"
              id={`comfyui_model-list-search`}
              placeholder={t('default.search')}
              value={fuzzy}
              onChange={(e) => setFuzzy(e.target.value)}
            />
            <InputGroupAddon align={'inline-end'}>
              <InputGroupButton
                onClick={handler(async () => {
                  setFuzzy('');
                  await fetch({ search: () => ({}) });
                })}
              >
                <XIcon />
              </InputGroupButton>
              <InputGroupButton type="submit">
                <SearchIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>
        <TooltipDialog
          tooltip={<SquarePlusIcon />}
          onSubmit={handler(async (data: FormData) => {
            await comfyuis.proxy.model.create({
              ...comfyuis.model.default,
              code: data.get('code') as string,
              name: data.get('name') as string,
            });
            await fetch();
            success(t('message.create.success'));
          })}
          info={dialogs.info(t, 'create', 'comfyui.model.id')}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`comfyui_model-code`}>
                {t('default.code') + '*'}
              </FieldLabel>
              <Input id={`comfyui_model-code`} name="code" required />
            </Field>
            <Field>
              <FieldLabel htmlFor={`comfyui_model-name`}>
                {t('default.name') + '*'}
              </FieldLabel>
              <Input id={`comfyui_model-name`} name="name" required />
            </Field>
          </FieldGroup>
        </TooltipDialog>
        <TooltipDialog
          tooltip={<FileDownIcon />}
          onSubmit={handler(async (data: FormData) => {
            if (!importer) {
              throw new BusinessError(
                'importer is required.',
                'comfyui.importer_invalid',
              );
            }
            const items: ComfyUIModel[] = [];
            await importer.configureObject(data, items);
            await comfyuis.proxy.model.import(items);
            await fetch();
            success(t('message.import.success'));
          })}
          info={dialogs.info(t, 'import', 'comfyui.model.id')}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`comfyui_model-importer`}>
                {t(`comfyui.model.importer`)}
              </FieldLabel>
              <Selector
                id={`comfyui_model-importer`}
                items={comfyuis.importers.registry.sorted()}
                name="importer"
                value={importer}
                onValueChange={setImporter}
                labelAccessor={(e) => t(`comfyui.model.importer_${e.id}`)}
                valueAccessor={(e) => e.id}
              />
            </Field>
            {element(importer?.configComponent)}
          </FieldGroup>
        </TooltipDialog>
      </div>
      <div className={'flex-1 flex flex-col overflow-hidden'}>
        <PagedItemList<ComfyUIModel>
          usePager={useComfyUIModelState}
          custom
          entryName={'comfyui.model.id'}
          itemKey={(u) => u.id}
          className={'flex flex-wrap items-start'}
        >
          {(u) => <ContentItem item={u} />}
        </PagedItemList>
      </div>
    </div>
  );
}
