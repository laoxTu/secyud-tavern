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
  useRefresh,
} from '@/components';
import { forms } from '@/global';
import { BusinessError } from '@/interceptors';
import { handler } from '@/interceptors/client';
import { ModelInputSummary, models } from '@/models/client';
import { RealmHistory } from '@/stories';
import { Feature, stories } from '@/stories/client';
import { proxy } from '@/stories/client/proxy';
import { realms, useRealmState } from '@/stories/realms/client';
import { jsonUtils } from '@/utils';

function Deleter() {
  const router = useRouter();
  const t = useTranslations();
  const { index, setIndex } = useRealmState();

  const { realm, histories } = realms;

  const reopen = handler(async (remain: boolean = true) => {
    const { id } = await stories.proxy.clone(realm.id);
    if (!remain) {
      await stories.proxy.delete(realm.id);
    }
    router.replace(`/${id}`);
  });

  return (
    <>
      <TooltipAlertDialog
        info={dialogs.info(t, 'realm.delete.output')}
        disabled={index.cur === 0}
        onSubmit={handler(async () => {
          const history = await realms.history(index.cur, realm);
          if (history.spaces.length) {
            history.spaces.splice(history.index, 1);
            history.index = Math.min(history.spaces.length - 1, history.index);
          }

          if (!history.spaces.length && index.cur < histories.length) {
            // 不是最后一页，且本页无输出了，合并到下一页
            const current = await realms.history(index.cur + 1, realm);
            current.summary ||= history.summary;
            if (history.content)
              current.content = current.content
                ? `${history.content}\n${current.content}`
                : history.content;

            current.properties = jsonUtils.merge(
              history.properties,
              current.properties,
            );
            await proxy.history.set(realm.id, history.sequence, {
              content: current.content,
              properties: current.properties,
            });
            await stories.proxy.history.del(realm.id, history.sequence);
            histories.splice(index.cur - 1, 1);
          } else {
            // 最后一页，只保存
            await proxy.history.set(realm.id, history.sequence, {
              spaces: [],
              index: -1,
            });
          }
          await setIndex();
        })}
      >
        <DeleteIcon />
      </TooltipAlertDialog>
      <TooltipAlertDialog
        info={dialogs.info(t, 'realm.delete.index')}
        disabled={index.cur === 0}
        onSubmit={handler(async () => {
          const { history: get } = realms;
          const history = await get(index.cur, realm);
          await stories.proxy.history.del(realm.id, history.sequence);
          histories.splice(index.cur - 1, 1);
          await setIndex();
        })}
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
  const { index, generating } = useRealmState();
  return (
    <IconTooltip
      text={'realm.regenerate_reply_tip'}
      disabled={index.max === 0}
      onClick={handler(async () => {
        const { histories } = realms;
        const last = histories.at(-1);
        // 没有历史是无法重新生成的。
        if (!last || generating) return;
        last.index = last.spaces.length;
        last.spaces.push({ operations: [], outputs: [] });
        await realms.generate();
      })}
    >
      <RotateCcwIcon />
    </IconTooltip>
  );
}

function Viewer() {
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
          const history = await realms.history(null, realm);
          // 用当前输入框内容构造一个"虚拟待发历史"，追加到 histories 后走一遍真实构建流程，
          // 让用户预览这次输入实际会发给模型的上下文
          const virtual: RealmHistory = {
            masterId: realm.id,
            sequence: histories.length,
            content: realms.input(),
            index: 0,
            spaces: [
              {
                operations: [],
                outputs: [],
              },
            ],
            summary: false,
            variables: history ? realms.variables(history) : {},
          };
          const virtuals = [...structuredClone(histories), virtual];
          console.debug(`[input-viewer](histories): `, virtuals);
          // 工具调用初始化，防止虚拟上下文调用工具。
          for (const virtualHistory of virtuals) {
            if (!virtualHistory) continue;
            const space = realms.space(virtualHistory)!;
            for (const output of space.outputs) {
              if (!output.callings?.length) continue;
              for (const calling of output.callings) {
                calling.result ??= '';
              }
            }
          }

          const { summaries } = await models.processers.prompt({
            controller: new AbortController(),
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
  const t = useTranslations();
  const { index, setIndex } = useRealmState();
  const [history, setHistory] = useState<RealmHistory | undefined>(undefined);
  const { key, refreshKey } = useRefresh();
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
        if (index.cur <= 0) return;
        const history = await realms.history(index.cur, realm);
        setHistory(history);
        refreshKey();
      })}
      onSubmit={handler(async (data) => {
        if (index.cur <= 0) return;
        const history = await realms.history(index.cur, realm);
        const variablesText = forms.str(data, 'variables');
        history.variables = jsonUtils.parse(variablesText);
        if (!history.variables)
          throw new BusinessError(
            'json invalid',
            'realm.variable_invalid_json',
          );
        history.content = forms.str(data, `history_input`);
        const space = realms.space(history);
        if (space) {
          for (let i = 0; i < space.outputs.length; i++) {
            const output = space.outputs[i];
            output.content = forms.str(data, `history_output-${i}`);
          }
        }
        await proxy.history.set(realm.id, history.sequence, {
          content: history.content,
          spaces: history.spaces,
        });
        await setIndex();
      })}
    >
      {history && (
        <FieldSet key={key} className={'overflow-auto p-2 flex-1'}>
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
            <Field>
              <FieldLabel htmlFor={`history_input`}>
                {t('realm.input')}
              </FieldLabel>
              <Textarea
                defaultValue={history.content}
                name={`history_input`}
                id={`history_input`}
                onKeyDown={submitTargetFormOnKey}
              />
            </Field>
            {realms.space(history)?.outputs.map((u, i) => (
              <Field key={i}>
                <FieldLabel>{`${t('realm.output')} ${i}`}</FieldLabel>
                <Textarea
                  defaultValue={u.content}
                  name={`history_output-${i}`}
                  onKeyDown={submitTargetFormOnKey}
                />
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
