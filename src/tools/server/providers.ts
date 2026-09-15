import { getRegistry, Registerable } from '@/plugins';
import { PresetItem } from '@/presets';
import { ArchiveNode } from '@/utils/archive';

import { Tool } from '..';

export interface ToolProvider<T = any> extends Registerable {
  loadArchive: (
    nodes: Record<string, ArchiveNode>,
    item: PresetItem<Tool<T>>,
    name: string,
  ) => Promise<void>;

  saveArchive: (
    nodes: Record<string, ArchiveNode>,
    item: PresetItem<Tool<T>>,
    name: string,
  ) => Promise<void>;
}

const registry = getRegistry<ToolProvider>('tool-provider');

export const providers = {
  registry,
};
