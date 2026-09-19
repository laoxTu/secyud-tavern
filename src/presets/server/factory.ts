import { Criteria } from '@/database/server/storage';
import { Preset, PresetEntry, PresetItem } from '@/presets';
import { ArchiveFolder } from '@/utils/archive';

import { repository } from './repository';
import { PresetArchiveContext, PresetStorage } from './storage';

export const storages = {
  create<TData>(
    { name: type, plural }: { name: string; plural: string },
    criteria: (entry: PresetEntry<TData>) => Criteria,
    /**
     * sequence是真正的唯一标识
     * 可以用作文件名的一部分
     * 请保证左右文件名前缀一致
     */
    loadArchive: (
      context: PresetArchiveContext,
      entry: PresetItem<TData>,
      sequence: number,
    ) => Promise<void>,
    /**
     * 注意name是.之前的名称 可能是 name-1
     * 只做解析用，真正的code在meta中
     */
    saveArchive: (
      context: PresetArchiveContext,
      name: string,
    ) => Promise<PresetItem<TData> | undefined>,
  ): PresetStorage {
    return {
      id: type,
      load: async (model: Preset) => {
        model.entries ??= {};
        const entries = await repository.entry.list(model.id, {
          search: { entryType: type },
        });
        if (entries.items.length) {
          model.entries[plural] = entries.items.map(
            (u: PresetEntry<TData>) => ({
              ...u.data,
              disabled: u.disabled,
              name: u.name,
            }),
          );
        }
      },
      save: async (model: Preset) => {
        if (!model.entries) return;
        const entries: PresetItem<TData>[] = model.entries[plural];
        if (entries?.length) {
          await repository.entry.make(
            model.id,
            type,
            entries.map((u) => ({
              data: {
                ...u,
                disabled: undefined,
                name: undefined,
                masterId: undefined,
              },
              disabled: u.disabled,
              name: u.name,
              masterId: model.id,
              entryType: type,
              entryId: 0,
            })),
          );
        }
      },
      async loadArchive({ item, cur, root, append }) {
        if (!item.entries) return;
        const entries: PresetItem<TData>[] = item.entries[plural];
        if (entries?.length) {
          const folder: ArchiveFolder = {
            type: 'folder',
            name: plural,
            nodes: {},
          };
          cur[plural] = folder;

          for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            await loadArchive(
              {
                cur: folder.nodes,
                root,
                item,
                append,
              },
              entry,
              i,
            );
          }
        }
      },
      async saveArchive({ item, cur, root, append }) {
        const folder = cur[plural];
        if (!folder || folder.type === 'file') return;
        const codes = [
          ...new Set(Object.keys(folder.nodes).map((u) => u.split('.')[0])),
        ];
        const entries: PresetItem<TData>[] = [];
        for (const code of codes) {
          const entry = await saveArchive(
            {
              cur: folder.nodes,
              root,
              item,
              append,
            },
            code,
          );
          if (entry) entries.push(entry);
        }
        item.entries ??= {};
        item.entries[plural] = entries;
      },
      criteria(item) {
        return item.data ? criteria(item) : {};
      },
    };
  },
};
