import { validate } from 'uuid';

import { Properties } from '@/database';
import { Storage } from '@/database/server';
import { storages } from '@/database/server/factory';
import { files } from '@/files/server';
import { getRegistry } from '@/plugins';
import { Preset } from '@/presets';
import { archive, Archive, ArchiveFolder, ArchiveNode } from '@/utils/archive';

export interface PresetArchiveContext extends Properties {
  root: Archive;
  cur: Archive;
  item: Preset;
  // 追加code
  append(id: string): void;
}

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
          const file = archive.set.buffer(node.nodes, name, cover.buffer);
          (item as any).coverType = cover.type;
          // 图片不压缩
          file.level = 0;
        }
      } catch (err) {
        console.error(err);
      }
    }
    archive.set.text(node.nodes, 'variables.json', item.variables);
    archive.set.text(node.nodes, 'opening.txt', item.opening);
    // 元数据
    archive.set.json(node.nodes, 'meta.json', {
      ...item,
      entries: undefined,
      variables: undefined,
      opening: undefined,
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
    const item = await archive.get.json<Preset>(node.nodes, 'meta.json');
    if (!item) return null;
    item.variables = await archive.get.text(node.nodes, 'variables.json');
    item.opening = await archive.get.fuzzy(node.nodes, 'opening.');
    const type = (item as any).coverType;
    const buffer = await archive.get.buffer(
      node.nodes,
      `cover.${extensionMap[type]}`,
    );
    if (buffer) {
      const cover = await files.repository.create({
        type: `image/${type}`,
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
