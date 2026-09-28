'use client';
import { utils } from '@/database';
import { ModelInputSummary, models } from '@/models/client';
import { presets } from '@/presets/client';
import { stories } from '@/stories/client';
import { useRealmState } from '@/stories/client/realms';
import { Realm } from '@/stories/realms';
import { Task, TaskRunner } from '@/tasks';
import { tools as main, ToolCall } from '@/tools';
import { agents } from '@/tools/agents/client';
import { tab } from '@/tools/client/content';
import { feature } from '@/tools/client/feature';
import { fetchers } from '@/tools/fetchers/client';
import { scripts } from '@/tools/scripts/client';
import { variables } from '@/tools/variables/client';

import { providers } from './providers';
import { processer, ToolCache } from './realm';

export type * from './providers';

export interface ToolProperty {
  // 这个因为一开始都是勾选的，直接存disabled
  items: Record<string, boolean>;
}

function cache(realm: Realm) {
  return models.cache<ToolCache>(realm, main.name);
}

export function summary(callings: ToolCall[], items: ModelInputSummary[]) {
  for (const calling of callings) {
    items.push({
      role: `tool: ${calling.name}`,
      content: `${calling.id}\narguments: \n${calling.arguments}\nresponse: \n${calling.result ?? 'error'}`,
    });
  }
}

/**
 * 工具调用的任务管理，管理当前执行的调用。
 */
class Manager extends TaskRunner<ToolCall> {
  setRealmInfo: (
    name: string,
    realmInfo?: import('@/stories/client/realms').RealmInfo,
  ) => void;
  aborted = false;
  constructor(protected cache: ToolCache) {
    super();
    const { setAbort, setRealmInfo } = useRealmState.getState();
    setAbort(() => (this.aborted = true));
    this.setRealmInfo = setRealmInfo;
  }

  protected async execute(toolCall: ToolCall) {
    if (this.aborted) return;
    try {
      // 按函数名找配置，再经 toolId 找具体实现。
      const tool = this.cache.tools[toolCall.name];
      if (tool) {
        console.debug(`[tool]: `, tool.name);
        const args = JSON.parse(toolCall.arguments);
        this.setRealmInfo(toolCall.id, {
          title: 'tool.calling_tool',
          content: toolCall.name,
        });
        toolCall.result = await tool.invoke(args, toolCall);
      } else {
        toolCall.result = '';
      }
    } catch (err: any) {
      // 错误写回给模型调整，同时 console.error 供人工排查。
      toolCall.result = `error: ${err?.message ?? 'unknown error'}`;
      console.error(err);
    } finally {
      this.setRealmInfo(toolCall.id);
    }

    return 'success';
  }
  protected async cancel() {}

  protected async finish(task: Task<ToolCall>) {
    await super.finish(task);
    this.check();
  }

  private resolve?: (value: void | PromiseLike<void>) => void;
  private promise?: Promise<void>;

  check() {
    if (this.running.size || this.pending.length) {
      return;
    }
    this.resolve?.();
  }

  wait(): Promise<void> {
    return (this.promise ??= new Promise((resolve) => {
      this.resolve = resolve;
      this.check();
    }));
  }
}

export const tools = {
  ...main,
  summary,
  cache,
  providers: providers,
  processer,
  property(realm: Realm) {
    return utils.getProperty<ToolProperty>(realm, main.name, () => ({
      items: {},
    }));
  },
  actives(realm: Realm) {
    return Object.values(cache(realm).tools).filter((t) => !t.disabled);
  },
  calling: async (realm: Realm, toolCalls?: ToolCall[]) => {
    if (!toolCalls?.length) return;
    const cache: ToolCache = tools.cache(realm);

    const { setRealmInfo } = useRealmState.getState();

    const manager = new Manager(cache);

    setRealmInfo('main', {
      title: 'tool.calling_tool',
    });

    for (const toolCall of toolCalls.filter((u) => !u.result)) {
      await manager.create(toolCall.id, toolCall);
    }
    await manager.wait();
  },
  tab: {
    preset: tab,
  },
  feature,
};

export default async function () {
  presets.tabs.register(tools.tab.preset);
  models.processers.registry.register(tools.processer);
  stories.features.registry.register(feature);
  tools.providers.registry.register(
    variables,
    fetchers,
    scripts.tool,
    agents.tool,
  );
}
