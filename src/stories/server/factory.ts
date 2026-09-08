import { Criteria } from '@/database/server';
import { Story, StoryEntry, StoryItem } from '@/stories';

import { repository } from './repository';
import { StoryStorage } from './storage';

export const storages = {
  create<TData>(
    { name: type, plural }: { name: string; plural: string },
    criteria: (entry: StoryEntry<TData>) => Criteria,
  ): StoryStorage {
    return {
      id: type,
      load: async (model: Story) => {
        model.entries ??= {};
        const entries = await repository.entry.list(model.id, {
          search: { entryType: type },
        });
        if (entries.items.length) {
          model.entries[plural] = entries.items.map((u: StoryEntry<TData>) => ({
            ...u.data,
            name: u.name,
            entryId: u.entryId,
          }));
        }
      },
      save: async (model: Story) => {
        if (!model.entries) return;
        const entries: StoryItem<TData>[] = model.entries[plural];
        if (entries?.length) {
          await repository.entry.make(
            model.id,
            type,
            entries.map((u) => ({
              data: {
                ...u,
                name: undefined,
                masterId: undefined,
              },
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
