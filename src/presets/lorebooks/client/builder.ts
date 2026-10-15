import { getRegistry, Registerable } from '@/global';
import {
  InjectMessage,
  ModelInjectContext,
  ModelPromptContext,
  models,
} from '@/models/client';
import { PresetItem } from '@/presets';
import { macros } from '@/presets/macros/client';
import { MatchContext, matchers } from '@/presets/matchers/client';
import { AlwaysMatchConfig } from '@/presets/matchers/client/always';
import { realms } from '@/stories/realms/client';
import { arrUtils } from '@/utils';

import { Lorebook } from '..';

import { LorebookCache, lorebooks } from '.';

export interface LorebookBuilder extends Registerable {
  create: (
    promptCtx: ModelPromptContext,
    injectCtx: ModelInjectContext,
    cache: LorebookCache,
  ) => Promise<InjectMessage>;
}

const registry = getRegistry<LorebookBuilder>('lorebook_builder');

const defaultBuilder: LorebookBuilder = {
  async create(
    { histories, converts, realm }: ModelPromptContext,
    { name, prompt, assist, system, caller }: ModelInjectContext,
    cache: LorebookCache,
  ): Promise<InjectMessage> {
    const visited = new Set<string | undefined>();
    // 准备好的世界书
    const prepared: PresetItem<Lorebook>[] = [];
    const total = Object.values(cache.entries);
    let simulation = 0;
    let index = 0;
    // 首位注入，把always的当作首位
    await fixed(cache.before);
    let matchContext: MatchContext = null!;
    return {
      async before(i: number) {
        const history = histories[i];
        matchContext = {
          history,
          cache,
        };
        await prepare(await matchers.prompt(total, matchContext));
        // 这里如果是最后一条，还需要准备常驻的后置条目
        if (i === histories.length - 1) await fixed(cache.after);
        prepared.sort(lorebooks.compare);
        // 添加user前世界书
        await inject();
      },
      async middle() {
        // 添加user后世界书
        await inject(true);
      },
      async behind(i: number) {
        if (i === histories.length - 1) return;
        const history = histories[i];
        await moved(history, realms.outputs(history), true);
      },
    };

    /**
     * 注入世界书
     * @param remain 是否注入全部
     */
    async function inject(remain: boolean = false) {
      if (!prepared.length) return;
      let last: number | undefined = undefined;
      if (!remain) {
        // 准备，根据层级，注入可能在一条语句的前后
        const i = prepared.findIndex((u) => u.layer >= 100);
        last = i >= 0 ? i : undefined;
      }
      const items = prepared.splice(0, last);
      const groups = arrUtils.groupSerial(items, (u) => u.role);
      console.debug('[lorebook]: ', items);
      for (const group of groups) {
        const contents: string[] = [];
        for (const item of group.items) {
          const content = await models.convert(converts, item.content ?? '', {
            role: group.key,
            type: 'output',
            history: null,
          });
          contents.push(content);
        }
        const content = arrUtils.join(contents, '\n\n');
        switch (group.key) {
          case 'knowledge':
            simulation += 1;
            caller('', null, [
              {
                index: 0,
                id: `${name(simulation)}l`,
                name: models.engines.knowledge.info.name,
                arguments: models.engines.knowledge.args({
                  type: 'lorebook',
                }),
                result: content,
              },
            ]);
            break;
          case 'system':
            system(content);
            break;
          case 'assistant':
            assist(content, null);
            break;
          case 'user':
            prompt(content);
            break;
          default:
            break;
        }
      }
    }

    /**
     * 滑动注入lorebook
     * @param history
     * @param messages
     * @param output
     */
    async function prepare(ids: string[]) {
      for (const id of ids) {
        if (visited.has(id)) continue;
        visited.add(id);
        const lorebook = cache.entries[id];
        if (lorebook) {
          prepared.push(cache.entries[id]);
        }
      }
    }

    /**
     * 一次性注入lorebook
     * @param items
     */
    async function fixed(items: PresetItem<Lorebook<AlwaysMatchConfig>>[]) {
      const { checkItems } = macros.property(realm);
      for (const lorebook of items) {
        // 已经验证过的不重复注入
        if (visited.has(lorebook.id)) continue;
        visited.add(lorebook.id);
        if (
          // 未绑定宏的直接注入
          !lorebook.expression.macro ||
          // 在宏配置中未设置未disabled可以注入
          !checkItems[lorebook.expression.macro]
        )
          prepared.push(lorebook);
      }
    }
  },
  id: 'default',
};

export const builders = {
  registry,
  default: defaultBuilder,
};
