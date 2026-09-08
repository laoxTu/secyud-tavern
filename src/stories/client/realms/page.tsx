'use client';
import {
  ArrowBigLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CornerDownLeftIcon,
  PinIcon,
  PinOffIcon,
  SquareStopIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
  Button,
  ButtonGroup,
  Checkbox,
  element,
  IconTooltip,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
  Label,
  Spinner,
  submitTargetFormOnKey,
} from '@/components';
import { Loading } from '@/global/client/loading';
import { useHandler } from '@/interceptors/client';
import { models } from '@/models/client';
import { stories } from '@/stories/client';

import { realms, useRealmState } from '.';

interface LoadingState {
  // 加载中
  loading: boolean;
  // 加载成功
  success: boolean;
  // 已开始加载
  started: boolean;
}

function RealmTips() {
  const t = useTranslations();
  const { realmInfo, generating } = useRealmState();
  return (
    <>
      {generating && (
        <div className="fixed right-2 top-2">
          <Item>
            <ItemMedia>
              <Spinner />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="line-clamp-1">
                {t(realmInfo.title)}
              </ItemTitle>
            </ItemContent>
            <ItemContent className="flex-none justify-end">
              <span className="text-sm tabular-nums">{realmInfo.content}</span>
            </ItemContent>
          </Item>
        </div>
      )}
    </>
  );
}

function UserInput() {
  const { generating, setSignal, content, setContent, summary, setSummary } =
    useRealmState();
  const { handler } = useHandler();
  const t = useTranslations();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 发送输入内容，并尝试创建新历史
  const triggerCreate = handler(async () => {
    await realms.generate(true);
  });

  useEffect(() => {
    const window = realms.iframe?.contentWindow as any;
    if (!window) return;
    window.userInput = {
      text: {
        element: () => inputRef.current,
        get: () => content,
        set: (value: any) => setContent(value),
      },
      summary: { get: () => summary, set: (value: any) => setSummary(value) },
      inputBuilders: [], // { id: string, sequence?: number, build: (text: string) => string }
    };
  }, [inputRef]);

  return (
    <>
      <form action={triggerCreate}>
        <InputGroup className={'bg-white'}>
          <InputGroupTextarea
            ref={inputRef}
            id="slot-user-input"
            name="slot-user-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('default.ctrl_enter_submit')}
            onKeyDown={submitTargetFormOnKey}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText>
              <Checkbox
                name={'summary'}
                id={'summary-checkbox'}
                checked={summary}
                onCheckedChange={setSummary}
              />
              <Label htmlFor={'summary-checkbox'}>{t('default.summary')}</Label>
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupAddon align={'inline-end'}>
            {generating ? (
              <InputGroupButton
                type="button"
                disabled={false}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setSignal(undefined, 'user canceled');
                }}
              >
                <SquareStopIcon />
              </InputGroupButton>
            ) : (
              <InputGroupButton type="submit">
                <CornerDownLeftIcon />
              </InputGroupButton>
            )}
          </InputGroupAddon>
        </InputGroup>
      </form>
    </>
  );
}

export function PageControl() {
  const { handler } = useHandler();
  const { index, setIndex, output, setOutput, prepare, setPrepare } =
    useRealmState();

  useEffect(() => {
    if (prepare) {
      handler(async () => {
        setPrepare(false);
        console.debug(`[realm](render page): start`);
        const {
          iframe,
          realm,
          history: { get },
        } = realms;
        if (!iframe) return;
        const { index } = useRealmState.getState();
        const history = await get(index.cur, realm);
        await stories.renderers.content({ realm, history });
      })();
    }
  }, [prepare]);

  const changeIndex = handler(async (cur?: number) => {
    await setIndex(cur);
  });
  const changeOutput = handler(async (cur?: number) => {
    await setOutput(cur);
  });

  return (
    <>
      <form
        action={(formData) => {
          const curPage = Number(formData.get('realm-index'));
          return changeIndex(curPage);
        }}
      >
        <ButtonGroup className={'bg-white rounded-md'}>
          <Button
            onClick={() => changeIndex(index.cur - 1)}
            disabled={index.cur <= 0}
            variant="outline"
          >
            <ChevronLeftIcon />
          </Button>
          <Input
            key={index.cur}
            defaultValue={index.cur}
            name="realm-index"
            disabled={index.max === 0}
            type={'number'}
            className={'bg-white'}
          />
          <Button
            onClick={() => changeIndex(index.max)}
            disabled={index.cur === index.max}
            variant="outline"
          >
            {index.max}
          </Button>
          <Button
            onClick={() => changeIndex(index.cur + 1)}
            disabled={index.cur >= index.max}
            variant="outline"
          >
            <ChevronRightIcon />
          </Button>
        </ButtonGroup>
      </form>
      <ButtonGroup className={'  bg-white rounded-md'}>
        <Button
          onClick={() => changeOutput(output.cur - 1)}
          disabled={output.cur <= 0}
          variant="outline"
        >
          <ChevronLeftIcon />
        </Button>
        <Input
          className={'text-center text-black bg-white min-w-8'}
          disabled
          value={`${output.cur + 1}/${output.max}`}
        ></Input>
        <Button
          onClick={() => changeOutput(output.cur + 1)}
          disabled={output.cur + 1 >= output.max}
          variant="outline"
        >
          <ChevronRightIcon />
        </Button>
      </ButtonGroup>
    </>
  );
}

export default function RealmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { error } = useHandler();
  const [loadingState, setLoadingState] = useState<LoadingState>({
    loading: false,
    success: false,
    started: false,
  });
  const { pinned, setPinned, initPager } = useRealmState();
  const route = useRouter();

  const loadingCurrentSlot = async () => {
    try {
      setLoadingState((u) => ({
        ...u,
        loading: true,
        success: false,
      }));
      const { id } = await params;
      const realm = await stories.proxy.realm.id(id);
      await models.processers.initialize({ realm });
      await stories.renderers.initialize({ realm });
      realms.realm = realm;
      await initPager();
      setLoadingState((u) => ({
        ...u,
        success: true,
      }));
    } catch (err) {
      setLoadingState((u) => ({
        ...u,
        success: false,
      }));
      error(err);
    } finally {
      setLoadingState((u) => ({
        ...u,
        loading: false,
      }));
    }
  };

  useEffect(() => {
    (async () => {
      setLoadingState((u) => ({ ...u, started: true }));
      await loadingCurrentSlot();
    })();
  }, []);

  if (loadingState.loading || !loadingState.started) return <Loading />;

  return (
    <>
      {/* key不要删除。发布后，如果没有这个key，会导致引用有问题，原因不明，开发环境无此问题。 */}
      <iframe
        key={1}
        ref={(iframe) => {
          realms.iframe = iframe!;
        }}
        width={'100%'}
        height={'100%'}
      />
      <RealmTips />
      <div className="fixed inset-0 top-auto min-h-20 sc-dc">
        <div className={`flex-col ${pinned ? 'flex' : 'sc-dc-flex'}`}>
          <fieldset
            className={'m-auto flex justify-center flex-wrap'}
            disabled={!loadingState.started || loadingState.loading}
          >
            {loadingState.success && (
              <>
                <PageControl />
                {stories.features.registry.sorted().map((u, i) => (
                  <div key={u.id} className="bg-background">
                    {element(u.component)}
                  </div>
                ))}
              </>
            )}
            <div className="bg-background">
              <IconTooltip
                text={'realm.back_home_tip'}
                onClick={() => route.replace('/')}
              >
                <ArrowBigLeftIcon />
              </IconTooltip>
            </div>
            <div className="bg-background">
              <IconTooltip
                text={pinned ? 'realm.unpin_chatbox' : 'realm.pin_chatbox'}
                onClick={() => setPinned(!pinned)}
              >
                {pinned ? <PinOffIcon /> : <PinIcon />}
              </IconTooltip>
            </div>
          </fieldset>
          <fieldset className={'w-full'} disabled={!loadingState.success}>
            <UserInput />
          </fieldset>
        </div>
      </div>
    </>
  );
}
