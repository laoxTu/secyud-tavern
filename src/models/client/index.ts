import { settings } from '@/global/client';
import { anthropics } from '@/models/anthropic/client';
import { proxy } from '@/models/client/proxy';
import { deepseeks } from '@/models/deepseek/client';
import { openais } from '@/models/openai/client';
import { Realm } from '@/stories';
import { realms } from '@/stories/client/realms';

import { models as main } from '..';

import { engines } from './engine';
import { processers } from './processer';
import { setting } from './setting';

export * from './component';
export * from './state';
export type * from './engine';
export type * from './processer';

/**
 * 传递message的处理委托，
 * 用于批量替换或更改文字
 * text: 发送内容 即未变换的原文
 * role: 发送角色 ai user system tool等
 * type：发送类型 input output tool等
 */
export type ConvertContent = (
  text: string,
  role: string,
  type: string,
) => Promise<string>;

async function convert(
  converts: ConvertContent[],
  {
    str,
    role,
    type,
  }: {
    str: string;
    role: string;
    type: string;
  },
) {
  let res = str;
  for (const convert of converts) {
    res = await convert(res, role, type);
  }
  return res.trim();
}

export const models = {
  ...main,
  engines,
  processers,
  key(key: string) {
    return `model.${key}`;
  },
  proxy,
  convert,
  setting,
  cache<T = any>(realm: Realm, key: string) {
    return realms.context<T>(realm, models.key(key));
  },
};

export default async function () {
  settings.tabs.register(models.setting);
  engines.registry.register(
    openais.engine,
    deepseeks.engine,
    anthropics.engine,
  );
}
