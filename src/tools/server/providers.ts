import { getRegistry, Registerable } from '@/plugins';
import { PresetItem } from '@/presets';
import { PresetArchiveContext } from '@/presets/server/storage';

import { Tool } from '..';

interface ToolArchiveContext<T = any> extends PresetArchiveContext {
  entry: PresetItem<Tool<T>>;
  name: string;
}

export interface ToolProvider<T = any> extends Registerable {
  loadArchive: (context: ToolArchiveContext<T>) => Promise<void>;

  saveArchive: (context: ToolArchiveContext<T>) => Promise<void>;
}

const registry = getRegistry<ToolProvider>('tool-provider');

export const providers = {
  registry,
};
