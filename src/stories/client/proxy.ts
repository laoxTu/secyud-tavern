import { del, get, post, put } from '@/client';
import {
  DataRequest,
  DataResponse,
  Entity,
  EntryOperator,
  EntryRequestParam,
  InDto,
} from '@/database';
import {
  Realm,
  RealmHistory,
  Story,
  StoryEntry,
  StoryRequestOptions,
  StoryRequestParam,
} from '@/stories';

export const proxy = {
  async get(id: string, options?: StoryRequestOptions): Promise<Story> {
    return await get('stories/{id}', {
      params: { id, ...(options ?? {}) },
    });
  },
  async list(
    request?: DataRequest<StoryRequestParam>,
  ): Promise<DataResponse<Story>> {
    return await get('stories', {
      params: request,
    });
  },
  async create(story: Story | InDto<Story>): Promise<Entity> {
    return await post('stories', story);
  },
  async update(id: string, story: Partial<Story>): Promise<Entity> {
    return await put('stories/{id}', story, {
      params: { id },
    });
  },
  async clone(id: string): Promise<Entity> {
    return await post(
      'stories/{id}/clone',
      {},
      {
        params: { id },
      },
    );
  },
  async delete(id: string): Promise<void> {
    return await del('stories/{id}', {
      params: { id },
    });
  },
  history: {
    async get(id: string, index: number): Promise<RealmHistory> {
      return await get('stories/{id}/histories/{sequence}', {
        params: { id, sequence: index },
      });
    },
    async add(
      id: string,
      history: RealmHistory,
    ): Promise<{ sequence: number }> {
      return await post('stories/{id}/histories', history, {
        params: { id },
      });
    },
    async set(
      id: string,
      sequence: number,
      history: RealmHistory,
    ): Promise<void> {
      await put('stories/{id}/histories/{sequence}', history, {
        params: { id, sequence },
      });
    },
    async del(id: string, sequence: number): Promise<void> {
      await del('stories/{id}/histories/{sequence}', {
        params: { id, sequence },
      });
    },
  },
  realm: {
    async get(story: Story): Promise<Realm> {
      return await get('stories/realm', {
        params: { story },
      });
    },
    async id(id: string): Promise<Realm> {
      return await get('stories/realm/{id}', {
        params: { id },
      });
    },
  },
  entry: {
    async list<TData = any>(
      id: string,
      request?: DataRequest<EntryRequestParam>,
    ): Promise<DataResponse<StoryEntry<TData>>> {
      return await get('stories/{id}/entries', {
        params: { id, ...(request ?? {}) },
      });
    },
    async add<TData = any>(
      id: string,
      entryType: string,
      entry: EntryOperator<StoryEntry<TData>>,
    ): Promise<{ entryId: number }> {
      return await post('stories/{id}/entries/{entryType}', entry, {
        params: { id, entryType },
      });
    },
    async set<TData = any>(
      id: string,
      entryType: string,
      entryId: number,
      entry: Partial<StoryEntry<TData>>,
    ): Promise<{ entryId: number }> {
      return await put('stories/{id}/entries/{entryType}/{entryId}', entry, {
        params: { id, entryType, entryId },
      });
    },
    async del(id: string, entryType: string, entryId: number) {
      await del('stories/{id}/entries/{entryType}/{entryId}', {
        params: { id, entryType, entryId },
      });
    },
    async clone<TData = any>(
      id: string,
      entryType: string,
      entryId: number,
      entry: Partial<StoryEntry<TData>>,
    ): Promise<Entity> {
      return await post(
        'stories/{id}/entries/{entryType}/{entryId}/clone',
        entry,
        {
          params: { id, entryType, entryId },
        },
      );
    },
  },
};
