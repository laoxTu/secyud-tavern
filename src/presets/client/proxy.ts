import { v4 } from 'uuid';

import { del, get, open, post, put } from '@/client';
import {
  DataRequest,
  DataResponse,
  Entity,
  EntryOperator,
  EntryRequestParam,
  InDto,
  NameValue,
} from '@/database';
import {
  Preset,
  PresetEntry,
  PresetRequestOptions,
  PresetRequestParam,
} from '@/presets';

export const proxy = {
  async get(id: string, options?: PresetRequestOptions): Promise<Preset> {
    return await get('presets/{id}', {
      params: { id, ...(options ?? {}) },
    });
  },
  async list(
    request?: DataRequest<PresetRequestParam>,
  ): Promise<DataResponse<Preset>> {
    return await get('presets', {
      params: request,
    });
  },
  async create(preset: Preset | InDto<Preset>): Promise<Entity> {
    return await post('presets', preset);
  },
  async update(id: string, preset: Partial<Preset>): Promise<Entity> {
    return await put('presets/{id}', preset, {
      params: { id },
    });
  },
  async delete(id: string): Promise<void> {
    return await del('presets/{id}', {
      params: { id },
    });
  },
  async clone(id: string, preset: Partial<Preset>): Promise<Entity> {
    return await post('presets/{id}/clone', preset, {
      params: { id },
    });
  },
  entry: {
    async list<TData = any>(
      id: string,
      request?: DataRequest<EntryRequestParam>,
    ): Promise<DataResponse<PresetEntry<TData>>> {
      return await get('presets/{id}/entries', {
        params: { id, ...(request ?? {}) },
      });
    },
    async add<TData = any>(
      id: string,
      entryType: string,
      entry: EntryOperator<PresetEntry<TData>>,
    ): Promise<{ entryId: number }> {
      return await post('presets/{id}/entries/{entryType}', entry, {
        params: { id, entryType },
      });
    },
    async set<TData = any>(
      id: string,
      entryType: string,
      entryId: number,
      entry: Partial<PresetEntry<TData>>,
    ): Promise<{
      entryId: number;
    }> {
      return await put('presets/{id}/entries/{entryType}/{entryId}', entry, {
        params: { id, entryType, entryId },
      });
    },
    async del(id: string, entryType: string, entryId: number) {
      await del('presets/{id}/entries/{entryType}/{entryId}', {
        params: { id, entryType, entryId },
      });
    },
    async clone<TData = any>(
      id: string,
      entryType: string,
      entryId: number,
      entry: Partial<PresetEntry<TData>>,
    ): Promise<Entity> {
      return await post(
        'presets/{id}/entries/{entryType}/{entryId}/clone',
        entry,
        {
          params: { id, entryType, entryId },
        },
      );
    },
  },
  async export(id: string) {
    await open('presets/{id}/export', {
      params: { id },
    });
  },
  import: {
    async prepare(file: File) {
      const sessionId = v4();
      const formData = new FormData();
      formData.append('file', file);
      const nameValues: NameValue[] = await post('presets/import', formData, {
        params: { sessionId },
      });
      return {
        sessionId,
        nameValues,
      };
    },
    async confirm(sessionId: string, list: string[]): Promise<{ id: string }> {
      return await put('presets/import', list, { params: { sessionId } });
    },
  },
};
