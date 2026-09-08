'use client';
import {
  ChevronsDownIcon,
  ChevronsUpIcon,
  ClipboardCopyIcon,
  CopyIcon,
  SearchIcon,
  SquarePlusIcon,
  TriangleIcon,
  XIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useRef, useState } from 'react';

import { ComfyUIParam, ComfyUIParamClipboard } from '@/comfyui';
import { comfyuis, ParamConfigurator } from '@/comfyui/client';
import { ComfyUIWorkflowNameValueField } from '@/comfyui/client/components';
import { useComfyUIWorkflowState } from '@/comfyui/client/state';
import {
  Button,
  Card,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DeleteDialog,
  dialogs,
  element,
  EmptySelectContent,
  Field,
  FieldLabel,
  IconTooltip,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  MonacoEditor,
  PagedItemList,
  PageRefreshOptions,
  rowHalf,
  rowQuat,
  Selector,
  spanHalf,
  submitTargetFormOnKey,
  Textarea,
  TooltipDialog,
  UpdateForm,
  useFormRef,
  useRefresh,
} from '@/components';
import { useHandler } from '@/interceptors/client';
import { cn } from '@/lib/utils';

function Property() {
  const t = useTranslations();
  const { handler, success } = useHandler();
  const { item, setItem } = useComfyUIWorkflowState();
  const form = useFormRef();

  if (!item) return null;

  return (
    <>
      <UpdateForm
        form={form}
        onSubmit={handler(async (data: FormData) => {
          await comfyuis.proxy.workflow.update(item.id, {
            name: data.get('name') as string,
            content: data.get('content') as string,
            description: data.get('description') as string,
          });
          await setItem(item.id);
        })}
      >
        <Field>
          <FieldLabel htmlFor={`comfyui_workflow-name`}>
            {t('default.name')}
          </FieldLabel>
          <Input
            name="name"
            id={`comfyui_workflow-name`}
            defaultValue={item.name}
          />
        </Field>
        <Field className={cn(spanHalf, rowHalf)}>
          <FieldLabel htmlFor={`comfyui_workflow-workflow_content`}>
            {t('default.content')}
            <IconTooltip
              text={'comfyui.workflow.generate_params'}
              onClick={handler(async () => {
                await comfyuis.proxy.workflow.param.generate(item.id);
                success(t('message.comfyui.workflow.param.generate.success'));
              })}
            >
              <TriangleIcon />
            </IconTooltip>
          </FieldLabel>
          <MonacoEditor
            name={'workflow_content'}
            value={item.content ?? ''}
            language={'json'}
            formRef={form}
          />
        </Field>
        <Field className={cn(spanHalf, rowQuat)}>
          <FieldLabel htmlFor={`comfyui_workflow-description`}>
            {t('default.description')}
          </FieldLabel>
          <Textarea
            onKeyDown={submitTargetFormOnKey}
            name={'description'}
            id={`comfyui_workflow-description`}
            defaultValue={item.description}
          />
        </Field>
      </UpdateForm>
    </>
  );
}

function ParamProperty({
  entry,
  refresh,
}: {
  entry: ComfyUIParam;
  refresh: () => Promise<void>;
}) {
  const { type, masterId, name, sequence } = entry;
  const t = useTranslations();
  const { handler, success } = useHandler();
  const { key, refreshKey } = useRefresh();
  const { item } = useComfyUIWorkflowState();
  const [editor, setEditor] = useState<ParamConfigurator | null>(
    comfyuis.configurators.registry.record(type),
  );
  const form = useFormRef();
  const [open, setOpen] = useState(true);

  if (!item) return null;

  return (
    <Collapsible
      className={'flex-row overflow-clip'}
      render={<Card />}
      key={key}
      open={open}
      onOpenChange={setOpen}
    >
      <div className={'flex flex-col w-12 p-2'}>
        <Button
          size={'icon'}
          variant={'ghost'}
          className={'m-auto'}
          onClick={() => setOpen((u) => !u)}
        >
          {open ? <ChevronsUpIcon /> : <ChevronsDownIcon />}
        </Button>
        <CollapsibleTrigger
          nativeButton={false}
          render={<div />}
          className={
            'flex-1 overflow-hidden rounded-md  cursor-pointer hover:bg-gray-100'
          }
        >
          <p
            className={'flex-1 text-xs px-2 m-auto'}
            style={{
              writingMode: 'vertical-lr',
            }}
          >
            {entry.name}
          </p>
        </CollapsibleTrigger>
        <div className={'flex flex-col m-auto'}>
          <IconTooltip
            text={'message.copy.tooltip'}
            onClick={handler(async () => {
              const json: ComfyUIParamClipboard = {
                type: 'comfyui_param',
                masterId,
                sequence,
                param: {},
              };
              await navigator.clipboard.writeText(JSON.stringify(json));
              success(t('message.copy.success'));
            })}
          >
            <ClipboardCopyIcon />
          </IconTooltip>
          <TooltipDialog
            tooltip={<CopyIcon />}
            onSubmit={handler(async (data: FormData) => {
              await comfyuis.proxy.workflow.param.clone(masterId, sequence, {
                name: data.get('name') as string,
              });
              success(t('message.clone.success'));
              await refresh();
            })}
            info={dialogs.info(t, 'clone', `${name}.id`)}
          >
            <Field>
              <FieldLabel htmlFor={`preset-${name}-clone-name`}>
                {t('default.name') + '*'}
              </FieldLabel>
              <Input name={'name'} required id={`preset-${name}-clone-name`} />
            </Field>
          </TooltipDialog>
          <DeleteDialog
            onDelete={handler(async () => {
              await comfyuis.proxy.workflow.param.del(masterId, sequence);
            })}
            itemName={`${name}.id`}
          />
        </div>
      </div>
      <CollapsibleContent className={'h-full'} style={{ width: '72vw' }}>
        <UpdateForm
          form={form}
          onSubmit={handler(async (data: FormData) => {
            const param: ComfyUIParam = {
              sequence,
              masterId,
              config: {},
              type: data.get('type') as string,
              name: data.get('name') as string,
            };
            await editor?.configureObject?.(data, param);
            await comfyuis.proxy.workflow.param.set(item.id, sequence, param);
            await refresh();
            refreshKey();
          })}
        >
          <Field>
            <FieldLabel htmlFor={`param-name-${sequence}`}>
              {t('default.name')}
            </FieldLabel>
            <Input
              name="name"
              id={`param-name-${sequence}`}
              defaultValue={name}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`param-type-${sequence}`}>
              {t('comfyui.workflow.param.type')}
            </FieldLabel>
            <Selector
              id={`param-type-${sequence}`}
              items={comfyuis.configurators.registry.sorted()}
              name={'type'}
              value={editor}
              onValueChange={setEditor}
              labelAccessor={(e) => t(`comfyui.workflow.param.type_${e.id}`)}
              valueAccessor={(e) => e.id}
            />
          </Field>
          {element(editor?.configComponent, {
            param: entry,
            formRef: form,
          })}
        </UpdateForm>
      </CollapsibleContent>
    </Collapsible>
  );
}

function Params() {
  const size = 5;
  const t = useTranslations();
  const { item } = useComfyUIWorkflowState();
  const { handler } = useHandler();
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ComfyUIParam[] | undefined>();
  const curRef = useRef<PageRefreshOptions>({
    size,
    page: 0,
  });

  const [page, setPage] = useState({ cur: 0, max: 0 });

  const refresh = handler(
    async (option?: PageRefreshOptions) => {
      setLoading(true);
      if (!item) return;
      if (option) curRef.current = option;
      const { page } = curRef.current;
      const result = await comfyuis.proxy.workflow.param.list(item.id, {
        size,
        skip: (page ?? 0) * size,
        search: {
          filter,
        },
      });
      setItems(result.items);
      setPage({
        cur: page ?? 0,
        max: Math.floor(result.length / size),
      });
    },
    async () => setLoading(false),
  );

  if (!item) return null;

  return (
    <div className={'flex-1 flex flex-col'}>
      <div className="flex flex-wrap">
        <form
          action={async (data: FormData) => {
            setFilter(data.get('filter') as string);
            await refresh();
          }}
          className={'flex-1'}
        >
          <InputGroup>
            <InputGroupInput
              name="filter"
              id={`preset-entry-filter`}
              placeholder={t('default.search')}
              value={filter}
            />
            <InputGroupAddon align={'inline-end'}>
              <InputGroupButton
                onClick={async () => {
                  setFilter('');
                  await refresh();
                }}
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
            await comfyuis.proxy.workflow.param.add(item.id, {
              masterId: '',
              sequence: 0,
              name: data.get('name') as string,
              type: 'text',
              config: {},
            });
            await refresh();
          })}
          info={dialogs.info(t, 'create', `${name}.id`)}
        >
          <Field>
            <FieldLabel htmlFor={`preset-${name}-create-name`}>
              {t('default.name') + '*'}
            </FieldLabel>
            <Input name={'name'} required id={`preset-${name}-create-name`} />
          </Field>
        </TooltipDialog>
      </div>
      <div
        className={'flex-1 flex overflow-x-auto scrollbar-none'}
        key={`entry-loading-${loading}`}
      >
        <PagedItemList
          custom
          entryName={'comfyui.param.id'}
          usePager={() => ({
            items,
            loading,
            size,
            refresh,
            ...page,
          })}
        >
          {(entry) => <ParamProperty entry={entry} refresh={refresh} />}
        </PagedItemList>
      </div>
    </div>
  );
}

export function WorkflowContent() {
  const t = useTranslations();
  const { handler, success } = useHandler();
  const { item, setItem } = useComfyUIWorkflowState();

  return (
    <div className={'h-full flex flex-col'}>
      <div className={'flex flex-wrap p-1'}>
        <div className={'flex-1'}>
          <ComfyUIWorkflowNameValueField
            orientation={'horizontal'}
            value={item ? comfyuis.workflow.toNameValue(item) : null}
            onValueChange={(v) => setItem(v?.value)}
          />
        </div>
        <TooltipDialog
          tooltip={<SquarePlusIcon />}
          onSubmit={handler(async (data: FormData) => {
            const { id } = await comfyuis.proxy.workflow.create({
              ...comfyuis.workflow.default,
              name: data.get('name') as string,
            });
            await setItem(id);
            success(t('message.create.success'));
          })}
          info={dialogs.info(t, `create`, `model.id`)}
        >
          <Field>
            <FieldLabel htmlFor={`model-name`}>
              {t('default.name') + '*'}
            </FieldLabel>
            <Input id={`model-name`} name="name" required />
          </Field>
        </TooltipDialog>
        <DeleteDialog
          itemName={`model.id`}
          disabled={!item}
          onDelete={handler(async () => {
            if (!item) return;
            await comfyuis.proxy.workflow.delete(item.id);
            await setItem(undefined);
            success(t('message.delete.success'));
          })}
        />
        <TooltipDialog
          tooltip={<CopyIcon />}
          disabled={!item}
          onSubmit={handler(async (data: FormData) => {
            if (!item) return;
            const { id } = await comfyuis.proxy.workflow.clone(item.id, {
              name: data.get('name') as string,
            });
            await setItem(id);
            success(t('message.clone.success'));
          })}
          info={dialogs.info(t, 'clone', 'model.id')}
        >
          <Field>
            <FieldLabel htmlFor={`model-clone-name`}>
              {t('default.name') + '*'}
            </FieldLabel>
            <Input
              id={`model-clone-name`}
              defaultValue={item?.name}
              name="name"
              required
            />
          </Field>
        </TooltipDialog>
      </div>
      {item ? (
        <React.Fragment key={item.id}>
          <Property />
          <Params />
        </React.Fragment>
      ) : (
        <EmptySelectContent module={'comfyui.workflow.id'} />
      )}
    </div>
  );
}
