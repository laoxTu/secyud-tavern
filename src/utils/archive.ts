import JSZip from 'jszip';

import { jsonUtils } from './json';
import { strUtils } from './str';

// 文件
export interface ArchiveFile {
  // 文件名称
  name: string;
  type: 'file';
  content: () => Promise<Buffer | undefined>;
  level?: number;
}

// 文件夹
export interface ArchiveFolder {
  // 目录名称
  name: string;
  type: 'folder';
  nodes: Archive;
}
export type ArchiveNode = ArchiveFolder | ArchiveFile;

export type Archive = Record<string, ArchiveNode>;
/**
 * 存档文件需要一个公用接口，只用ArchiveNode做标准转换
 * 后面可以提供流式方案，也就是content作为一个async getter
 * @param archives 存档
 * @returns 压缩文件缓冲
 */
async function archiveToZip(archives: Archive) {
  const zip = new JSZip();
  for (const archive of Object.values(archives)) {
    await appendNode(archive, 'root');
  }

  return await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6,
    },
  });

  async function appendNode(node: ArchiveNode, parent: string) {
    if (node.type === 'file') {
      const option: JSZip.JSZipFileOptions | undefined =
        node.level === undefined
          ? undefined
          : {
              compression: node.level === 0 ? 'STORE' : 'DEFLATE',
              compressionOptions: {
                level: node.level ?? 9,
              },
            };
      const content = await node.content();
      if (content?.length) {
        zip.file(`${parent}/${node.name}`, content, option);
      }
    } else {
      for (const sub of Object.values(node.nodes)) {
        await appendNode(sub, `${parent}/${node.name}`);
      }
    }
  }
}

async function zipToArchive(zipBuffer: Buffer) {
  const zip = new JSZip();
  await zip.loadAsync(zipBuffer);
  const archives: Archive = {};

  const files = zip.filter((_, file) => !file.dir);
  for (const entry of files) {
    // entry.path 形如 'root/images/photo.jpg'
    const parts = entry.name.split('/');

    if (parts[0] !== 'root') continue;

    // 最后一段是文件名，拆出 name 和 extension
    const name = parts.at(-1)!;

    let buffer: Promise<Buffer> | undefined = undefined;
    create(archives, parts.slice(1, -1), {
      name,
      type: 'file',
      content() {
        return (buffer ??= entry.async('nodebuffer'));
      },
    });
  }

  return archives;

  function create(nodes: Archive, path: string[], node: ArchiveNode) {
    if (path.length) {
      const name = path[0];
      let find = nodes[name];
      if (!find) {
        find = {
          type: 'folder',
          name,
          nodes: {},
        };
        nodes[name] = find;
      }
      if (find.type === 'folder') {
        create(find.nodes, path.slice(1), node);
      } else {
        console.error(`except to be folder, but file: ${name}`);
      }
    } else {
      nodes[node.name] = node;
    }
  }
}

const set = {
  buffer(archive: Archive, name: string, buffer?: Buffer): ArchiveFile {
    const res: ArchiveFile = {
      type: 'file',
      name,
      content: async () => buffer,
    };
    archive[name] = res;
    return res;
  },
  text(archive: Archive, name: string, text?: string): ArchiveFile {
    return set.buffer(
      archive,
      name,
      text ? strUtils.toBuffer(text) : undefined,
    );
  },
  json(archive: Archive, name: string, json?: any) {
    return set.text(archive, name, json ? JSON.stringify(json) : undefined);
  },
};

const get = {
  async buffer(nodes: Archive, name: string): Promise<Buffer | undefined> {
    const value = nodes[name];
    if (value && value.type === 'file') {
      return await value.content();
    }
    return undefined;
  },
  async text(nodes: Archive, name: string): Promise<string | undefined> {
    const buffer = await get.buffer(nodes, name);
    if (buffer) {
      return strUtils.buffer(buffer);
    }
    return undefined;
  },
  /**
   * 提供一个模糊前缀的取法，可以忽略它的后缀去读
   * @returns
   */
  async fuzzy(nodes: Archive, prefix: string): Promise<string | undefined> {
    const name = Object.keys(nodes).find((u) => u.startsWith(prefix));
    if (name) {
      const buffer = await get.buffer(nodes, name);
      if (buffer) {
        return strUtils.buffer(buffer);
      }
    }
    return undefined;
  },
  async json<T = any>(nodes: Archive, name: string): Promise<T | undefined> {
    return jsonUtils.parse(await get.text(nodes, name));
  },
};

export const archive = {
  archiveToZip,
  zipToArchive,
  get,
  set,
};
