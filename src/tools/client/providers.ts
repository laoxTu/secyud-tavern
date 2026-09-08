import React from 'react';

import { getRegistry, Registerable } from '@/plugins';
import { PresetEntry, PresetItem } from '@/presets';
import { Realm } from '@/stories';
import { Tool } from '@/tools';
import { JsonSchema } from '@/utils/json-schema';

export interface ToolItem<TArgs = any> {
  name: string;
  description: string;
  parameters: JsonSchema;
  disabled?: boolean;
  /**
   * 调用工具，获取返回信息
   */
  invoke: (args: TArgs) => Promise<string>;
}

export interface ToolProps<T = any> {
  entry: PresetEntry<Tool<T>>;
  formRef: React.RefObject<HTMLFormElement | null>;
}

export interface ToolProvider<T = any> extends Registerable {
  configComponent?: React.ComponentType<ToolProps<T>>;
  configureObject?: (data: FormData, tool: Tool<T>) => Promise<void>;
  create: (entry: PresetItem<Tool<T>>, realm: Realm) => Promise<ToolItem[]>;
}

const registry = getRegistry<ToolProvider>('tool-provider');

export const providers = {
  registry,
};
