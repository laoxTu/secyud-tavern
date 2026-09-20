import { CharacterCard, OpenAIPreset } from 'parsecard';
import { v4 } from 'uuid';

import { Lorebook, LorebookRole } from '@/lorebooks';
import { AlwaysMatchConfig } from '@/lorebooks/client/matchers/always';
import { NormalMatchConfig } from '@/lorebooks/client/matchers/normal';
import { Preset, PresetItem } from '@/presets';
import { Macro } from '@/presets/macros';
import { Regex } from '@/presets/regexes';
import { Script } from '@/presets/scripts';
import { Style } from '@/presets/styles';

/**
 * 提取所有变量赋值宏，输出为 Record<string, string[]>
 * 支持：setglobalvar / setvar / $ 简写 / . 简写
 * 所有作用域统一视为全局
 */
function extract(
  content: string | null,
  records: Record<string, string[]>,
): string {
  const add = (key: string, value: string) => {
    const k = key.trim();
    if (!records[k]) records[k] = [];
    records[k].push(value.trim());
  };

  let cleaned = content ?? '';

  // 1. setglobalvar::key::value
  cleaned = cleaned.replace(
    /\{\{setglobalvar::([^:}]+)::(.*?)\}\}/g,
    (_, key, value) => {
      add(key, value);
      return '';
    },
  );

  // 2. setvar::key::value
  cleaned = cleaned.replace(
    /\{\{setvar::([^:}]+)::(.*?)\}\}/g,
    (_, key, value) => {
      add(key, value);
      return '';
    },
  );

  // 3. $key = value
  cleaned = cleaned.replace(
    /\{\{\$([\w-]+)\s*=\s*(.*?)\}\}/g,
    (_, key, value) => {
      add(key, value);
      return '';
    },
  );

  // 4. .key = value
  cleaned = cleaned.replace(
    /\{\{\.([\w-]+)\s*=\s*(.*?)\}\}/g,
    (_, key, value) => {
      add(key, value);
      return '';
    },
  );

  cleaned = cleaned
    // getglobalvar::key
    .replace(
      /\{\{getglobalvar::([^:}]+)\}\}/g,
      (_, key) => `<%~ it.${key.trim()} %>`,
    )
    // getvar::key
    .replace(/\{\{getvar::([^:}]+)\}\}/g, (_, key) => `<%~ it.${key.trim()} %>`)
    // $key 简写（全局）
    .replace(/\{\{\$([\w-]+)\}\}/g, (_, key) => `<%~ it.${key} %>`)
    // .key 简写（局部）
    .replace(/\{\{\.([\w-]+)\}\}/g, (_, key) => `<%~ it.${key} %>`)
    // key 简写（全局）
    .replace(/\{\{([\w-]+)\}\}/g, (_, key) => `<%~ it.${key} %>`);

  return cleaned;
}

/**
 * macro:
 *   chara_name,
 *   chara_description,
 *   chara_personality,
 *   chara_mes_example,
 *   opening,
 *   system_prompt,
 *   callback,
 *
 * @param card 角色卡
 * @param cover 封面
 */
async function preset(card: OpenAIPreset, cover?: string) {
  const lorebooks: PresetItem<Lorebook>[] = [];
  const macros: PresetItem<Macro>[] = [];
  const scripts: PresetItem<Script>[] = [];
  const styles: PresetItem<Style>[] = [];
  const regexes: PresetItem<Regex>[] = [];
  const records: Record<string, string[]> = {};

  const prompts = card.prompts;
  if (prompts?.length) {
    for (const entry of prompts) {
      const content = extract(entry.content ?? null, records);

      const lorebook: PresetItem<Lorebook> = {
        disabled: !entry.enabled,
        code: entry.identifier,
        type: 'plaintext',
        match: 'always',
        expression: {},
        content,
        priority: 100,
        layer: 0,
        role: role(entry.role),
        name: entry.name,
      };

      // 常量表达式，如果是D就放在最后
      if (entry.injection_position === 0) {
        const expression: AlwaysMatchConfig = {
          last: true,
        };
        lorebook.expression = expression;
        lorebook.layer = Math.max(0, 10 - (entry.injection_depth ?? 0)) * 20;
      } else {
        lorebook.layer = Math.max(0, entry.injection_depth ?? 0) * 20;
      }

      lorebooks.push(lorebook);
    }
  }

  for (const [key, entries] of Object.entries(records)) {
    for (let i = 0; i < entries[1].length; i++) {
      const entry = entries[1][i];
      macro({
        name: `${key}_${i}`,
        code: `${key}_${i}`,
        key: key,
        value: entry,
      });
    }
  }
  const preset: Preset = {
    name: card.name,
    description: card.name,
    version: '1.0.0',
    tags: ['preset', 'silly-tavern'],
    opening: '<%~ it.opening %>',
    cover,
    // 依赖酒馆格式的预设，这个提供酒馆基础架构
    // 也可以是预设解析？
    requires: [],
    id: 's' + v4().replaceAll('-', ''),
    properties: {},
    entries: {
      lorebooks,
      regexes,
      scripts,
      styles,
      macros,
    },
  };

  return preset;
  function macro(macro: Partial<PresetItem<Macro>>) {
    macros.push({
      name: '',
      disabled: false,
      code: '',
      key: '',
      value: '',
      json: false,
      multiple: false,
      hidden: false,
      ...macro,
    });
  }
}

/**
 * macro:
 *   chara_name,
 *   chara_description,
 *   chara_personality,
 *   chara_mes_example,
 *   opening,
 *   system_prompt,
 *   callback,
 *
 * @param card 角色卡
 * @param cover 封面
 */
async function chara(card: CharacterCard, cover?: string) {
  const lorebooks: PresetItem<Lorebook>[] = [];
  const macros: PresetItem<Macro>[] = [];
  const scripts: PresetItem<Script>[] = [];
  const styles: PresetItem<Style>[] = [];
  const regexes: PresetItem<Regex>[] = [];
  const records: Record<string, string[]> = {};

  /**
   * silly-tavern 的基本格式将转换为宏设定。
   */
  // chara_name 角色描述
  macro({
    name: '角色名称',
    code: 'chara_name',
    key: 'chara_name',
    value: card.name,
  });

  // chara_description 性格设定
  macro({
    name: '角色描述',
    code: 'chara_desc',
    key: 'chara_desc',
    value: card.description,
  });

  // chara_personality 摘要
  macro({
    name: '角色描述',
    code: 'chara_personality',
    key: 'chara_personality',
    value: card.personality,
  });

  // chara_mes_example 示例对话
  macro({
    name: '示例对话',
    code: 'chara_mes_example',
    key: 'chara_mes_example',
    value: card.mesExample,
  });

  // opening 默认开场白
  macro({
    name: '开场白（默认）',
    code: 'opening',
    key: 'opening',
    value: card.firstMes,
  });

  // system_prompt 系统提示词
  macro({
    name: '系统提示词',
    code: 'system_prompt',
    key: 'system_prompt',
    value: card.systemPrompt,
  });

  // callback 后置指令
  macro({
    name: '系统提示词',
    code: 'callback',
    key: 'callback',
    value: card.systemPrompt,
  });

  // 多开场白，用多个宏导入
  const greetings = card.alternateGreetings;
  if (greetings?.length) {
    for (let i = 0; i < greetings.length; i++) {
      const greeting = greetings[i];
      macro({
        name: `开场白（${i}）`,
        code: `opening_${i}`,
        key: 'opening',
        value: greeting,
      });
    }
  }

  const worldEntries = card.characterBook?.entries;
  if (worldEntries?.length) {
    for (const entry of worldEntries) {
      const content = extract(entry.content, records);
      const lorebook: PresetItem<Lorebook> = {
        disabled: !entry.isEnabled,
        code: 'sl' + entry.uid,
        type: 'plaintext',
        match: 'always',
        expression: {},
        content,
        priority: 100,
        layer: 0,
        role: role(entry.role),
        name: entry.comment,
      };

      if (entry.constant) {
        // 常量表达式，如果是D就放在最后
        if (entry.position === 4) {
          const expression: AlwaysMatchConfig = {
            last: true,
          };
          lorebook.expression = expression;
          lorebook.layer = Math.max(0, 10 - (entry.delay ?? 0)) * 20;
        }
      } else {
        const keywords: string[][] = [];
        if (entry.keys.length) keywords.push([...entry.keys]);
        if (entry.secondaryKeys.length) keywords.push([...entry.secondaryKeys]);

        if (keywords.length) {
          const expression: NormalMatchConfig = {
            keywords,
            keywordsLength: keywords.length,
            fitCount: 1,
          };
          lorebook.match = 'normal';
          lorebook.expression = expression;
        }
      }

      lorebooks.push(lorebook);
    }
  }

  if (card.hasRegexScripts) {
    for (const entry of card.regexScripts) {
      regexes.push({
        disabled: entry.disabled,
        pattern: entry.findRegex,
        replacement: entry.replaceString,
        target:
          entry.promptOnly && entry.markdownOnly
            ? 'both'
            : entry.markdownOnly
              ? 'output'
              : 'input',
        name: entry.scriptName,
      });
    }
  }

  for (const [key, entries] of Object.entries(records)) {
    for (let i = 0; i < entries[1].length; i++) {
      const entry = entries[1][i];
      macro({
        name: `${key}_${i}`,
        code: `${key}_${i}`,
        key: key,
        value: entry,
      });
    }
  }
  const preset: Preset = {
    name: card.name,
    description: card.creatorNotes,
    version: card.characterVersion,
    tags: card.tags,
    cover,
    // 依赖酒馆格式的预设，这个提供酒馆基础架构
    // 也可以是预设解析？
    requires: [
      {
        name: 'silly-tavern',
        value: 'silly-tavern',
      },
    ],
    id: 's' + v4().replaceAll('-', ''),
    properties: {
      author: card.creator,
    },
    entries: {
      lorebooks,
      regexes,
      scripts,
      styles,
      macros,
    },
  };

  return preset;
  function macro(macro: Partial<PresetItem<Macro>>) {
    const value = extract(macro.value ?? null, records);

    macros.push({
      name: '',
      disabled: false,
      code: '',
      key: '',
      json: false,
      multiple: false,
      hidden: false,
      ...macro,
      value,
    });
  }
}

/**
 * 将silly tavern的角色转换成对应角色
 * 包含数字映射和字符串映射
 * @param role 角色
 * @returns
 */
function role(role?: number | string | null): LorebookRole {
  switch (role) {
    case 0:
    case 'system':
      return 'system';
    case 1:
    case 'user':
      return 'user';
    case 3:
    case 'assistant':
    case 'ai':
      return 'assistant';
    default:
      return 'knowledge';
  }
}

export const sillyTaverns = {
  chara,
  preset,
};
