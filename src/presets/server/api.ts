import { eq } from 'drizzle-orm';

import { InDto } from '@/database';
import { forms } from '@/global';
import { BusinessError } from '@/interceptors';
import { route } from '@/interceptors/server';
import { Preset, PresetEntry, PresetRequestOptions } from '@/presets';
import { Archive, archive } from '@/utils/archive';
import { cache, fileUtils, response } from '@/utils/server';

import { PresetTraversalContext } from './repository';
import { storage } from './storage';

import { presets } from '.';

const importKey = (id: string) => `preset_import_${id}`;

export default {
  presets: {
    GET: route(async (_, records) => {
      const request = records.searchParams;
      const data = await presets.repository.list(request);
      return response.json(data);
    }),
    POST: route(async (request) => {
      const preset: Preset = await request.json();
      const id = await presets.repository.create(preset);
      return response.json({ id });
    }),
    import: {
      POST: route(async (request, records) => {
        const { sessionId } = records.searchParams;
        const data = await request.formData();
        const file = forms.file(data, 'file');
        const uint8 = await file.arrayBuffer();

        const items: Preset[] = [];
        const root = await archive.zipToArchive(Buffer.from(uint8));
        const append = () => {};
        for (const node of Object.values(root)) {
          const item = await storage.save(root, node, append);
          if (item) items.push(item);
        }

        await cache.set(importKey(sessionId), items);
        return response.json(items.map(presets.toNameValue));
      }),
      PUT: route(async (request, records) => {
        const { sessionId } = records.searchParams;
        const imports = new Set(await request.json());
        const list = await cache.get<Preset[]>(importKey(sessionId));
        await cache.delete(importKey(sessionId));
        let res = undefined;
        for (const preset of list) {
          if (!imports.has(preset.id)) continue;
          const exist = await presets.repository.exist((e) =>
            eq(e.id, preset.id),
          );
          if (exist) {
            await presets.repository.delete(preset.id);
          }
          const entity = await presets.repository.create(preset);
          if (!res) res = entity;
        }

        return response.json({ id: list[0].id });
      }),
    },
    '[id]': {
      clone: {
        POST: route(async (request, records) => {
          const preset: Partial<Preset> = await request.json();
          const { id: sourceId } = await records.params;
          const source = await presets.repository.get(sourceId);
          const target = { ...source, ...preset, id: '' };
          const id = await presets.repository.create(target);
          return response.json({ id });
        }),
      },
      export: {
        GET: route(async (_, records) => {
          const { id } = await records.params;

          const root: Archive = {};
          const context: PresetTraversalContext = {
            async action(item) {
              const node = await storage.load(root, item, context.append!);
              if (node) root[item.id] = node;
            },
          };
          const source = await presets.repository.traversal(context, [id], {
            entities: true,
          });
          console.debug(root);
          const buffer = await archive.archiveToZip(root);
          const stream = fileUtils.createBufferStream(buffer);
          return response.download(`preset_${source.at(-1)?.name}.zip`, stream);
        }),
      },
      GET: route(async (_, record) => {
        const { id } = await record.params;
        const options: PresetRequestOptions | undefined = record.searchParams;
        const preset = await presets.repository.get(id, options);
        return response.json(preset);
      }),
      PUT: route(async (request, record) => {
        const { id: originId } = await record.params;
        const preset: InDto<Preset> = await request.json();
        const id = await presets.repository.update(originId, preset);
        return response.json({ id });
      }),
      DELETE: route(async (_, record) => {
        const { id } = await record.params;
        await presets.repository.delete(id);
        return response.json(null);
      }),
      entries: {
        GET: route(async (_, record) => {
          const { id } = await record.params;
          const params = record.searchParams;
          const entry = await presets.repository.entry.list(id, params);
          return response.json(entry);
        }),
        '[entryType]': {
          POST: route(async (request, record) => {
            const { id, entryType } = await record.params;
            const entry = await request.json();
            const entryId = await presets.repository.entry.add(
              id,
              entryType,
              entry,
            );
            return response.json({ entryId });
          }),
          '[entryId]': {
            GET: route(async (_, record) => {
              const { id, entryType, entryId } = await record.params;
              const entry = await presets.repository.entry.get(
                id,
                entryType,
                entryId,
              );
              return response.json(entry);
            }),
            PUT: route(async (request, record) => {
              const { id, entryType, entryId } = await record.params;
              const entry = await request.json();
              await presets.repository.entry.set(id, entryType, entryId, entry);
              return response.json(null);
            }),
            DELETE: route(async (_, record) => {
              const { id, entryType, entryId } = await record.params;
              await presets.repository.entry.del(id, entryType, entryId);
              return response.json(null);
            }),
            clone: {
              POST: route(async (request, records) => {
                const {
                  id,
                  entryType,
                  entryId: sourceEntryId,
                } = await records.params;
                const entry: Partial<PresetEntry> = await request.json();
                if (!entry.masterId) {
                  throw new BusinessError(
                    '[clone] (preset entry): masterId is not specified!',
                  );
                }
                const source = await presets.repository.entry.get(
                  id,
                  entryType,
                  sourceEntryId,
                );
                const target = { ...source, ...entry };
                const entryId = await presets.repository.entry.add(
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
