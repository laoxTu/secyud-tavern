import { v4 } from 'uuid';

import { InDto } from '@/database';
import { BusinessError } from '@/interceptors';
import { route } from '@/interceptors/server';
import {
  RealmHistory,
  Story,
  StoryEntry,
  StoryRequestOptions,
} from '@/stories';
import { response } from '@/utils/server';

import { stories } from '.';

export default {
  stories: {
    GET: route(async (_, records) => {
      const request = records.searchParams;
      const data = await stories.repository.list(request);
      return response.json(data);
    }),
    POST: route(async (request) => {
      const story: Story = await request.json();
      const id = await stories.repository.create(story);
      return response.json({ id });
    }),
    realm: {
      GET: route(async (_, record) => {
        const { story } = await record.params;
        const realm = await stories.repository.getRealm(story);
        return response.json(realm);
      }),
      '[id]': {
        GET: route(async (_, record) => {
          const { id } = await record.params;
          const story = await stories.repository.get(id, {
            entities: true,
          });
          const realm = await stories.repository.getRealm(story);
          return response.json(realm);
        }),
      },
    },
    '[id]': {
      GET: route(async (_, record) => {
        const { id } = await record.params;
        const options: StoryRequestOptions | undefined = record.searchParams;
        const story = await stories.repository.get(id, options);
        return response.json(story);
      }),
      PUT: route(async (request, record) => {
        const { id: originId } = await record.params;
        const story: InDto<Story> = await request.json();
        const id = await stories.repository.update(originId, story);
        return response.json({ id });
      }),
      DELETE: route(async (_, record) => {
        const { id } = await record.params;
        await stories.repository.delete(id);
        return response.json(null);
      }),
      clone: {
        POST: route(async (_, record) => {
          const { id: originId } = await record.params;
          const story: Story = await stories.repository.get(originId);
          const id = await stories.repository.create({ ...story, id: v4() });
          return response.json({ id });
        }),
      },
      histories: {
        POST: route(async (request, record) => {
          const { id } = await record.params;
          const history: RealmHistory = await request.json();
          const sequence = await stories.repository.history.add(id, history);
          return response.json({ sequence });
        }),
        '[sequence]': {
          GET: route(async (_, record) => {
            const { id, sequence: index } = await record.params;
            const history = await stories.repository.history.get(id, index);
            return response.json(history);
          }),
          PUT: route(async (request, record) => {
            const { id, sequence } = await record.params;
            const history: RealmHistory = await request.json();
            await stories.repository.history.set(id, sequence, history);
            return response.json(null);
          }),
          DELETE: route(async (_, record) => {
            const { id, sequence } = await record.params;
            await stories.repository.history.del(id, sequence);
            return response.json(null);
          }),
        },
      },
      entries: {
        GET: route(async (_, record) => {
          const { id } = await record.params;
          const params = record.searchParams;
          const entry = await stories.repository.entry.list(id, params);
          return response.json(entry);
        }),
        '[entryType]': {
          POST: route(async (request, record) => {
            const { id, entryType } = await record.params;
            const entry = await request.json();
            const entryId = await stories.repository.entry.add(
              id,
              entryType,
              entry,
            );
            return response.json({ entryId });
          }),
          '[entryId]': {
            GET: route(async (_, record) => {
              const { id, entryType, entryId } = await record.params;
              const entry = await stories.repository.entry.get(
                id,
                entryType,
                entryId,
              );
              return response.json(entry);
            }),
            PUT: route(async (request, record) => {
              const { id, entryType, entryId } = await record.params;
              const entry = await request.json();
              await stories.repository.entry.set(id, entryType, entryId, entry);
              return response.json(null);
            }),
            DELETE: route(async (_, record) => {
              const { id, entryType, entryId } = await record.params;
              await stories.repository.entry.del(id, entryType, entryId);
              return response.json(null);
            }),
            clone: {
              POST: route(async (request, records) => {
                const {
                  id,
                  entryType,
                  entryId: sourceEntryId,
                } = await records.params;
                const entry: Partial<StoryEntry> = await request.json();
                if (!entry.masterId) {
                  throw new BusinessError(
                    '[clone] (story entry): masterId is not specified!',
                  );
                }
                const source = await stories.repository.entry.get(
                  id,
                  entryType,
                  sourceEntryId,
                );
                const target = { ...source, ...entry };
                const entryId = await stories.repository.entry.add(
                  entry.masterId,
                  entryType,
                  target,
                );
                return response.json({ entryId });
              }),
            },
          },
        },
      },
    },
  },
};
