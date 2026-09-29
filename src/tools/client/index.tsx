'use client';
import { utils } from '@/database';
import { ModelInputSummary, models } from '@/models/client';
import { presets } from '@/presets/client';
import { stories } from '@/stories/client';
import { Realm } from '@/stories/realms';
import { tools as main, ToolCall } from '@/tools';
import { agents } from '@/tools/agents/client';
import { tab } from '@/tools/client/content';
import { feature } from '@/tools/client/feature';
import { fetchers } from '@/tools/fetchers/client';
import { scripts } from '@/tools/scripts/client';
import { variables } from '@/tools/variables/client';

import { providers } from './providers';
import { processer, ToolCache } from './realm';
import { calling } from './task';

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

export const tools = {
  ...main,
  summary,
  cache,
  providers: providers,
  processer,
  calling,
  property(realm: Realm) {
    return utils.getProperty<ToolProperty>(realm, main.name, () => ({
      items: {},
    }));
  },
  actives(realm: Realm) {
    return Object.values(cache(realm).tools).filter((t) => !t.disabled);
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
