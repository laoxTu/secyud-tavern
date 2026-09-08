import { ConvertContent, models } from '@/models/client';
import { getRegistry, Registerable } from '@/plugins';
import { realms } from '@/stories/client/realms';
import { Realm, RealmContext, RealmHistory } from '@/stories/realms';

export interface RealmInitContext extends RealmContext {
  id?: string;
}

export interface RealmRenderContext extends RealmContext {
  /**
   * 需要渲染的项目
   */
  history: RealmHistory;
  converts: ConvertContent[];
}

/**
 * 执行模型流程
 */
export interface Renderer<T = any> extends Registerable {
  init: (ctx: RealmInitContext) => Promise<T>;
  /**
   * 流式渲染
   */
  stream?: (ctx: RealmRenderContext, cache: T) => Promise<void>;
  /**
   * 总渲染
   */
  output?: (ctx: RealmRenderContext, cache: T) => Promise<void>;
}

const registry = getRegistry<Renderer>('realm-processer');

export const renderers = {
  registry,
  async initialize({ realm }: { realm: Realm }) {
    const context: RealmInitContext = {
      properties: {},
      realm,
    };
    await registry.use(async (p) => {
      const cache = await p.init(context);
      realms.initContext(realm, realms.key(p.id), cache);
    });
  },
  async content({ history, realm }: { history: RealmHistory; realm: Realm }) {
    const context: RealmRenderContext = {
      properties: {},
      history,
      realm,
      converts: [],
    };
    await registry.use(async (p) => {
      await p.output?.(context, realms.cache(realm, p.id));
    });
    await realms.message.content(history, async (str, type, role) =>
      models.convert(context.converts, { str, type, role }),
    );
    realms.message.variables(history);
  },
  async stream({ history, realm }: { history: RealmHistory; realm: Realm }) {
    const context: RealmRenderContext = {
      properties: {},
      history,
      realm,
      converts: [],
    };
    await registry.use(async (p) => {
      await p.stream?.(context, realms.cache(realm, p.id));
    });
    await realms.message.content(history, async (str, type, role) =>
      models.convert(context.converts, { str, type, role }),
    );
  },
};
