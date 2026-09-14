import { Storage } from '@/database/server';
import { storages } from '@/database/server/factory';
import { getRegistry } from '@/plugins';
import { Preset } from '@/presets';
import { ArchiveFolder } from '@/utils/archive';

export interface PresetStorage extends Storage<Preset> {
  // 将entity中的内容转移到archive中
  loadArchive(entity: Preset, archive: ArchiveFolder): Promise<void>;
  // 将archive中的内容转移到entity中
  saveArchive(entity: Preset, archive: ArchiveFolder): Promise<void>;
}

const registry = getRegistry<PresetStorage>('preset-storage');
const manager = {
  ...storages.createManager(registry),
  /**
   * 将entity中的内容转移到archive中
   * @param entity
   * @param archive
   */
  async loadArchive(entity: Preset, archive: ArchiveFolder) {
    await registry.use(async (provider) => {
      await provider.loadArchive(entity, archive);
    });
  },
  /**
   * 将archive中的内容转移到entity中
   * @param entity
   * @param archive
   */
  async saveArchive(entity: Preset, archive: ArchiveFolder) {
    await registry.use(async (provider) => {
      await provider.saveArchive(entity, archive);
    });
  },
};

export const storage = {
  registry,
  manager,
};
