import { fileTypeFromBuffer } from 'file-type';
import { validate } from 'uuid';

import { Properties } from '@/database';
import { files } from '@/database/files/server';
import { Storage } from '@/database/server';
import { storages } from '@/database/server/factory';
import { getRegistry } from '@/global';
import { Preset } from '@/presets';
import {
  Accessor,
  Archive,
  ArchiveFolder,
  ArchiveNode,
  archives,
} from '@/utils/archive';

export interface PresetArchiveContext extends Properties {
  root: Archive;
  cur: Archive;
  item: Preset;
  // 追加code
  append(id: string): void;
}
type AccessorKey = 'variables' | 'opening';
const accessor: Record<AccessorKey, Accessor<Preset>> = {
  variables: {
    get: (i) => i.variables,
    set: (i, t) => (i.variables = t),
  },
  opening: {
    get: (i) => i.opening,
    set: (i, t) => (i.opening = t),
  },
};
const extensionMap: Record<string, string> = {
  // PNG
  'image/png': 'png',

  // JPEG
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg', // 非标准但常见

  // GIF
  'image/gif': 'gif',

  // WebP
  'image/webp': 'webp',

  // SVG
  'image/svg+xml': 'svg',

  // BMP
  'image/bmp': 'bmp',

  // ICO
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico',

  // TIFF
  'image/tiff': 'tiff',

  // AVIF
  'image/avif': 'avif',

  // HEIC / HEIF（苹果）
  'image/heic': 'heic',
  'image/heif': 'heif',

  // APNG
  'image/apng': 'apng',
};

export interface PresetStorage extends Storage<Preset> {
  // 将entity中的内容转移到archive中
  loadArchive(context: PresetArchiveContext): Promise<void>;
  // 将archive中的内容转移到entity中
  saveArchive(context: PresetArchiveContext): Promise<void>;
}

const registry = getRegistry<PresetStorage>('preset-storage');
const manager = {
  ...storages.createManager(registry),
  /**
   * 将entity中的内容转移到archive中
   */
  async loadArchive(context: PresetArchiveContext) {
    await registry.use(async (provider) => {
      await provider.loadArchive(context);
    });
  },
  /**
   * 将archive中的内容转移到entity中
   */
  async saveArchive(context: PresetArchiveContext) {
    await registry.use(async (provider) => {
      await provider.saveArchive(context);
    });
  },
};

export const storage = {
  registry,
  manager,
  async load(
    root: Archive,
    item: Preset,
    append: (code: string) => void,
  ): Promise<ArchiveNode | null> {
    if (root[item.id]) return null;
    const node: ArchiveFolder = {
      type: 'folder',
      name: item.id,
      nodes: {},
    };
    root[item.id] = node;

    // 封面
    if (item.cover && validate(item.cover)) {
      try {
        const cover = await files.repository.get(item.cover, true);
        const ext = extensionMap[cover.type];
        if (ext) {
          const name = `cover.${ext}`;
          const file = archives.set.buffer(node.nodes, name, cover.buffer);
          item.cover = name;
          // 图片不压缩
          file.level = 0;
        }
      } catch (err) {
        console.error(err);
      }
    }
    archives.set.value(node.nodes, item, accessor.variables, 'variables.json');
    archives.set.value(node.nodes, item, accessor.opening, 'opening.txt');
    // 元数据
    archives.set.json(node.nodes, 'meta.json', {
      ...item,
      entries: undefined,
    });

    // 压入工作区
    await storage.manager.loadArchive({
      root,
      item,
      cur: node.nodes,
      append,
    });

    return node;
  },
  async save(
    root: Archive,
    node: ArchiveNode,
    append: (code: string) => void,
  ): Promise<Preset | null> {
    if (node.type !== 'folder') return null;
    const item = await archives.get.json<Preset>(node.nodes, 'meta.json');
    if (!item) return null;
    await archives.get.value(node.nodes, item, accessor.variables);
    await archives.get.value(node.nodes, item, accessor.opening);
    const buffer = await archives.get.buffer(node.nodes, item.cover ?? '');
    if (buffer) {
      const type = await fileTypeFromBuffer(buffer);
      const cover = await files.repository.create({
        type: type?.mime ?? '',
        args: null,
        buffer,
      });
      item.cover = cover;
    }
    await storage.manager.saveArchive({
      item,
      cur: node.nodes,
      root,
      append,
    });

    return item;
  },
};
