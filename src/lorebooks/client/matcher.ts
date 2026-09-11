import React from 'react';

import { Properties, utils } from '@/database';
import { Lorebook } from '@/lorebooks';
import { lorebooks } from '@/lorebooks/client';
import { getRegistry, Registerable } from '@/plugins';
import { PresetEntry, PresetItem } from '@/presets';
import { RealmHistory, RealmMessage, RealmOutput } from '@/stories';
import { realms } from '@/stories/client/realms';
import { arrUtils } from '@/utils';

import { LorebookCache } from './realm';

export interface MatchContext extends Properties {
  history: RealmHistory;
  message: RealmMessage;
  properties: Record<string, any>;
  output: boolean;
  cache: LorebookCache;
}

export interface Matcher extends Registerable {
  configComponent?: React.ComponentType<{ entry: PresetEntry<Lorebook> }>;
  configureObject?: (data: FormData, lorebook: Lorebook) => Promise<void>;
  match: (
    ctx: MatchContext,
    lorebook: PresetItem<Lorebook>,
  ) => Promise<boolean>;
}

const registry = getRegistry<Matcher>('lorebook-macher');

function content({ properties, output, message }: MatchContext) {
  const variableName = 'content';
  let content = properties[variableName] as string;
  if (!content && content !== '') {
    if (output) {
      const callings = (message as RealmOutput).callings;
      content = `${message.content ?? ''}${arrUtils.join(callings, '', (u) => u.result ?? '')}`;
    } else {
      content = message.content ?? '';
    }
    properties[variableName] = content;
  }
  return content;
}

function variables({ properties, history, output }: MatchContext) {
  const variableName = 'variables';
  let variables = properties[variableName];
  if (!variables) {
    variables = realms.variables(history, output);
    properties[variableName] = variables;
  }
  return variables;
}

/**
 * 根据匹配情况分析
 * 当前历史需要激活的世界书
 * @param items
 * @param context
 */
async function analyze(
  items: Record<string, PresetItem<Lorebook>>,
  context: MatchContext,
) {
  const message = context.message;
  const matchers = registry.records;
  const activeLorebooks: string[] = [];
  for (const [key, lorebook] of Object.entries(items)) {
    const matcher = matchers[lorebook.match];
    if (matcher && (await matcher.match(context, lorebook))) {
      activeLorebooks.push(key);
    }
  }
  utils.setProperty(message, lorebooks.plural, activeLorebooks);
  return activeLorebooks;
}

export const matchers = {
  registry,
  variables,
  content,
  analyze,
};
