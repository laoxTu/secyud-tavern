'use client';
import {
  DeleteIcon,
  EditIcon,
  MessageSquarePlusIcon,
  MessageSquareXIcon,
  RotateCcwIcon,
  TrashIcon,
  ViewIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Card,
  CardContent,
  CardHeader,
  dialogs,
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  IconTooltip,
  MonacoEditor,
  Skeleton,
  submitTargetFormOnKey,
  Textarea,
  TooltipAlertDialog,
  TooltipDialog,
  useFormRef,
} from '@/components';
import { BusinessError } from '@/interceptors';
import { useHandler } from '@/interceptors/client';
import { ModelInputSummary, models } from '@/models/client';
import { RealmHistory } from '@/stories';
import { Feature, stories } from '@/stories/client';
import { realms, useRealmState } from '@/stories/client/realms';
import { jsonUtils } from '@/utils';

function Deleter() {
  const { handler } = useHandler();
  const router = useRouter();
  const t = useTranslations();
  const { index, setIndex } = useRealmState();

  const reopen = handler(async (remain: boolean = true) => {
    const { id } = await stories.proxy.clone(realm.id);
    if (!remain) {
      await stories.proxy.delete(realm.id);
    }
    router.replace(`/${id}`);
  });

  const { realm, histories } = realms;
  const trash = handler(async () => {
    const {
      history: { get },
    } = realms;
    const history = await get(index.cur, realm);
    await stories.proxy.history.del(realm.id, history.sequence);
    histories.splice(index.cur - 1, 1);
    await setIndex();
  });

  return (
    <>
      <TooltipAlertDialog
        info={dialogs.info(t, 'realm.delete.output')}
        disabled={index.cur === 0}
        onSubmit={handler(async () => {
          const {
            history: { get, set },
          } = realms;
          const history = await get(index.cur, realm);
          if (history.outputs.length) {
            history.outputs.splice(history.output, 1);
            history.output = Math.min(
              history.outputs.length - 1,
              history.output,
            );
          }

          if (!history.outputs.length && index.cur < histories.length) {
            const current = await get(index.cur + 1, realm);
            current.summary ||= history.summary;
            current.prompts = [...history.prompts, ...current.prompts];
            await set(index.cur + 1, realm);
            await trash();
          } else {
            await set(index.cur, realm);
            await setIndex();
          }
        })}
      >
        <DeleteIcon />
      </TooltipAlertDialog>
      <TooltipAlertDialog
        info={dialogs.info(t, 'realm.delete.index')}
        disabled={index.cur === 0}
        onSubmit={trash}
      >
        <TrashIcon />
      </TooltipAlertDialog>
      <TooltipAlertDialog
        info={dialogs.info(t, 'realm.reopen')}
        disabled={index.cur === 0}
        onSubmit={() => reopen(false)}
      >
        <MessageSquareXIcon />
      </TooltipAlertDialog>
      <TooltipAlertDialog
        info={dialogs.info(t, 'realm.clone')}
        disabled={index.cur === 0}
        onSubmit={reopen}
      >
        <MessageSquarePlusIcon />
      </TooltipAlertDialog>
    </>
  );
}

function Regenerator() {
  const { handler } = useHandler();
  const { index } = useRealmState();
  return (
    <IconTooltip
      text={'realm.regenerate_reply_tip'}
      disabled={index.max === 0}
      onClick={handler(async () => {
        await realms.generate();
      })}
    >
      <RotateCcwIcon />
    </IconTooltip>
  );
}

function Viewer() {
  const { handler } = useHandler();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [summaries, setSummaries] = useState<ModelInputSummary[] | undefined>();
  const { realm, histories } = realms;

  return (
    <TooltipDialog
      tooltip={<ViewIcon />}
      info={dialogs.info(t, 'realm.viewer')}
      className={'flex flex-col overflow-hidden'}
      style={{ maxWidth: '86%', height: '86%' }}
      onOpen={handler(
        async () => {
          setLoading(true);
          const {
            history: { get },
          } = realms;
          const history = await get(null, realm);
          // 用当前输入框内容构造一个"虚拟待发历史"，追加到 histories 后走一遍真实构建流程，
          // 让用户预览这次输入实际会发给模型的上下文
          const virtual: RealmHistory = {
            masterId: realm.id,
            sequence: histories.length,
            prompts: [
              {
                content: useRealmState.getState().content,
                variables: [],
                properties: {},
              },
            ],
            output: -1,
            outputs: [],
            summary: false,
            variables: history ? realms.variables(history, true) : {},
          };
          const virtuals = [...structuredClone(histories), virtual];
          console.debug(`[input-viewer](histories): `, virtuals);
          // 工具调用初始化，防止虚拟上下文调用工具。
          for (const virtualHistory of virtuals) {
            if (!virtualHistory) continue;
            for (const outputs of virtualHistory.outputs) {
              for (const output of outputs) {
                if (!output.callings?.length) continue;
                for (const calling of output.callings) {
                  calling.result ??= '';
                }
              }
            }
          }

          const { summaries } = await models.processers.prompt({
            current: false,
            realm: {
              ...realm,
              histories: virtuals,
            },
          });
          setSummaries(summaries);
        },
        async () => setLoading(false),
      )}
    >
      {loading ? (
        <Card className="w-full max-w-xs">
          <CardHeader>
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="aspect-video w-full" />
          </CardContent>
        </Card>
      ) : (
        <div className={'overflow-auto p-2 flex-1'}>
          <p>{`${t('default.total_chars')}: ${summaries?.reduce((acc, cur) => acc + cur.content.length, 0) ?? 0}`}</p>
          <Accordion multiple>
            {summaries &&
              summaries.map((u, i) => (
                <AccordionItem value={`${i}`} key={i}>
                  <AccordionTrigger>
                    <span className={'w-48'}>{u.role}</span>
                    <span>{`${t('default.chars')}: ${u.content.length}`}</span>
                  </AccordionTrigger>
                  <AccordionContent className={'h-full'}>
                    <pre className={'text-wrap'}>{u.content}</pre>
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </div>
      )}
    </TooltipDialog>
  );
}

function Editor() {
  const { handler } = useHandler();
  const t = useTranslations();
  const { index, setIndex } = useRealmState();
  const [history, setHistory] = useState<RealmHistory | undefined>(undefined);
  const formRef = useFormRef();

  const { realm } = realms;
  return (
    <TooltipDialog
      info={dialogs.info(t, 'realm.edit')}
      tooltip={<EditIcon />}
      disabled={index.cur === 0}
      className={'flex flex-col overflow-hidden'}
      style={{ maxWidth: '86%', height: '86%' }}
      formRef={formRef}
      onOpen={handler(async () => {
        const {
          history: { get },
        } = realms;
        if (index.cur <= 0) return;
        const history = await get(index.cur, realm);
        setHistory(history);
      })}
      onSubmit={handler(async (data: FormData) => {
        const {
          history: { get, set },
        } = realms;
        if (index.cur <= 0) return;
        const history = await get(index.cur, realm);
        const variablesText = data.get('variables') as string;
        history.variables = jsonUtils.parse(variablesText);
        if (!history.variables)
          new BusinessError('json invalid', 'realm.variable_invalid_json');
        for (let i = 0; i < history.prompts.length; i++) {
          const input = history.prompts[i];
          input.content = data.get(`history_input-${i}`) as string;
        }
        for (let i = 0; i < history.outputs.length; i++) {
          const outputs = history.outputs[i];
          for (let j = 0; j < outputs.length; j++) {
            const output = outputs[j];
            output.content = data.get(`history_output-${i}-${j}`) as string;
          }
        }
        await set(index.cur, realm);
        await setIndex();
      })}
    >
      {history && (
        <FieldSet className={'overflow-auto p-2 flex-1'}>
          <FieldGroup className={'p-1'}>
            <Field>
              <FieldLabel>{t('realm.variable')}</FieldLabel>
              <MonacoEditor
                name={'variables'}
                value={JSON.stringify(history.variables)}
                language={'json'}
                formRef={formRef}
              />
              <Textarea
                disabled
                defaultValue={JSON.stringify(realms.variables(history))}
              />
            </Field>
          </FieldGroup>
          <FieldGroup className={'p-1'}>
            {history.prompts.map((u, i) => (
              <Field key={i}>
                <FieldLabel
                  htmlFor={`history_input-${i}`}
                >{`${t('realm.input')} ${i}`}</FieldLabel>
                <Textarea
                  defaultValue={u.content}
                  name={`history_input-${i}`}
                  id={`history_input-${i}`}
                  onKeyDown={submitTargetFormOnKey}
                />
              </Field>
            ))}
            {history.outputs.map((u, i) => (
              <Field key={i}>
                <FieldLabel
                  className={history.output === i ? 'text-red-600' : ''}
                >
                  {`${t('realm.output')} ${i}`}
                </FieldLabel>
                {u
                  .filter((v) => !v.callings?.length || v.content)
                  .map((v, vi) => (
                    <Textarea
                      key={vi}
                      defaultValue={v.content}
                      name={`history_output-${i}-${vi}`}
                      onKeyDown={submitTargetFormOnKey}
                    />
                  ))}
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>
      )}
    </TooltipDialog>
  );
}

export const feature: Feature[] = [
  {
    id: 'deleter',
    sequence: 1000,
    component: Deleter,
  },
  {
    id: 'regenerator',
    sequence: 1000,
    component: Regenerator,
  },
  {
    id: 'context-viewer',
    sequence: 1000,
    component: Viewer,
  },
  {
    id: 'history-editor',
    sequence: 1000,
    component: Editor,
  },
];
