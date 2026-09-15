import JSZip from 'jszip';

import { jsonUtils } from './json';
import { strUtils } from './str';

// 文件
export interface ArchiveFile {
  // 文件名称
  name: string;
  type: 'file';
  content: Buffer | string;
  level?: number;
}

// 文件夹
export interface ArchiveFolder {
  // 目录名称
  name: string;
  type: 'folder';
  nodes: Record<string, ArchiveNode>;
}
export type ArchiveNode = ArchiveFolder | ArchiveFile;

async function archiveToZip(archives: Record<string, ArchiveNode>) {
  const zip = new JSZip();
  for (const archive of Object.values(archives)) {
    appendNode(archive, 'root');
  }

  return await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6,
    },
  });

  function appendNode(node: ArchiveNode, parent: string) {
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
      zip.file(`${parent}/${node.name}`, node.content, option);
    } else {
      for (const sub of Object.values(node.nodes)) {
        appendNode(sub, `${parent}/${node.name}`);
      }
    }
  }
}
async function zipToArchive(zipBuffer: Buffer) {
  const zip = new JSZip();
  await zip.loadAsync(zipBuffer);
  const archives: Record<string, ArchiveNode> = {};

  const files = zip.filter((_, file) => !file.dir);
  for (const entry of files) {
    // entry.path 形如 'root/images/photo.jpg'
    const parts = entry.name.split('/');

    if (parts[0] !== 'root') continue;

    // 最后一段是文件名，拆出 name 和 extension
    const name = parts.at(-1)!;

    const content = await entry.async('nodebuffer');

    create(archives, parts.slice(1, -1), {
      name,
      type: 'file',
      content,
    });
  }

  return archives;

  function create(
    nodes: Record<string, ArchiveNode>,
    path: string[],
    node: ArchiveNode,
  ) {
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

function buffer(name: string, buffer: Buffer): ArchiveFile {
  return {
    type: 'file',
    name,
    content: buffer,
  };
}
function text(name: string, text: string): ArchiveFile {
  return {
    type: 'file',
    name,
    content: text,
  };
}

function get(nodes: Record<string, ArchiveNode>, name: string) {
  const value = nodes[name];
  if (!value || value.type === 'file') {
    return strUtils.buffer(value?.content);
  }
  return '';
}
export const archive = {
  archiveToZip,
  zipToArchive,
  text,
  buffer,
  json(name: string, json: any) {
    return text(name, JSON.stringify(json));
  },
  get,
  getJson<T = any>(nodes: Record<string, ArchiveNode>, name: string) {
    const meta = nodes[name];
    if (meta.type === 'file') {
      const item: T = jsonUtils.buffer(meta.content);
      return item;
    }
  },
};
