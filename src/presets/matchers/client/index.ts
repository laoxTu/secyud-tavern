import React from 'react';

import { Properties, utils } from '@/database';
import { getRegistry, Registerable } from '@/global';
import { PresetEntry, PresetItem } from '@/presets';
import { Lorebook } from '@/presets/lorebooks';
import { lorebooks } from '@/presets/lorebooks/client';
import { LorebookCache } from '@/presets/lorebooks/client/realm';
import { RealmHistory, RealmOutput, RealmSpace } from '@/stories';

export interface MatchContext extends Properties {
  history: RealmHistory;
  cache: LorebookCache;
}

export interface Matcher extends Registerable {
  configComponent?: React.ComponentType<{ entry: PresetEntry<Lorebook> }>;
  configureObject?: (data: FormData, lorebook: Lorebook) => Promise<void>;
  /**
   * 匹配输入，这里是匹配输入信息，从而注入到输入之后
   */
  prompt?: (
    ctx: MatchContext,
    lorebook: PresetItem<Lorebook>,
  ) => Promise<boolean>;
  /**
   * 匹配输出，这里取一段输出进行匹配，从而注入到输出之后
   */
  output?: (
    ctx: MatchContext,
    output: RealmOutput,
    lorebook: PresetItem<Lorebook>,
  ) => Promise<boolean>;
  /**
   * 匹配空间，匹配整个轮次空间，这里是所有输出结束后需要同一匹配一次，
   * 但current轮不注入
   */
  spaces?: (
    ctx: MatchContext,
    space: RealmSpace,
    lorebook: PresetItem<Lorebook>,
  ) => Promise<boolean>;
}

const registry = getRegistry<Matcher>('lorebook-matcher');

/**
 * 匹配输入
 */
async function prompt(
  total: PresetItem<Lorebook>[],
  context: MatchContext,
  recreate: boolean = false,
) {
  if (!recreate) {
    const exists = utils.getProperty<string[]>(
      context.history,
      lorebooks.plural,
    );
    if (exists) return exists;
  }
  const matchers = registry.records;
  const actives: string[] = [];
  for (const [key, lorebook] of Object.entries(total)) {
    const matcher = matchers[lorebook.match];
    const result = await matcher?.prompt?.(context, lorebook);
    if (result) actives.push(key);
  }
  // 输入直接用历史的properties
  utils.setProperty(context.history, lorebooks.plural, actives);
  return actives;
}

/**
 * 匹配输出
 */
async function output(
  total: PresetItem<Lorebook>[],
  output: RealmOutput,
  context: MatchContext,
  recreate: boolean = false,
) {
  if (!recreate) {
    const exists = utils.getProperty<string[]>(output, lorebooks.plural);
    if (exists) return exists;
  }
  const matchers = registry.records;
  const actives: string[] = [];
  for (const [key, lorebook] of Object.entries(total)) {
    const matcher = matchers[lorebook.match];
    const result = await matcher?.output?.(context, output, lorebook);
    if (result) actives.push(key);
  }
  // 输出用输出的properties
  utils.setProperty(output, lorebooks.plural, actives);
  return actives;
}

/**
 * 匹配空间
 */
async function spaces(
  total: PresetItem<Lorebook>[],
  space: RealmSpace | null,
  context: MatchContext,
  recreate: boolean = false,
) {
  if (!space) return [];
  if (!recreate) {
    const exists = utils.getProperty<string[]>(space, lorebooks.plural);
    if (exists) return exists;
  }
  const matchers = registry.records;
  const actives: string[] = [];
  for (const [key, lorebook] of Object.entries(total)) {
    const matcher = matchers[lorebook.match];
    const result = await matcher?.spaces?.(context, space, lorebook);
    if (result) actives.push(key);
  }
  // 空间用空间的properties
  utils.setProperty(space, lorebooks.plural, actives);
  return actives;
}

export const matchers = {
  registry,
  output,
  prompt,
  spaces,
};
