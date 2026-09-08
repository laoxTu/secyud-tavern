import { Criteria } from '@/database/server/storage';
import { Preset, PresetEntry, PresetItem } from '@/presets';

import { repository } from './repository';
import { PresetStorage } from './storage';

export const storages = {
  create<TData>(
    { name: type, plural }: { name: string; plural: string },
    criteria: (entry: PresetEntry<TData>) => Criteria,
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
      criteria(item) {
        return item.data ? criteria(item) : {};
      },
    };
  },
};
