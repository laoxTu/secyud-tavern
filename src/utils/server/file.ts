import { exec, ExecOptionsWithStringEncoding } from 'node:child_process';
import { Dirent } from 'node:fs';
import * as stream from 'node:stream/promises';

import * as fs from 'fs';
import promise from 'fs/promises';
import path from 'path';

/**
 * 目标路径是否存在
 * @param path
 */
export async function exists(path: string) {
  try {
    await promise.access(path);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * 创建目录
 * @param dir
 */
export async function mkdir(dir: string) {
  await promise.mkdir(dir, { recursive: true });
}

/**
 * 下载文件
 */
export async function download(
  url: string,
  dir: string,
  options?: {
    existAction?: () => Promise<void>;
    startAction?: () => Promise<void>;
    finishAction?: () => Promise<void>;
    progressAction?: (bytes: number, length: number) => Promise<void>;
    failedAction?: (response: Response) => Promise<void>;
    errorAction?: (err: any) => Promise<void>;
  },
) {
  if (await exists(dir)) {
    await options?.existAction?.();
    return;
  }
  // 创建目录，防止下载失败
  await mkdir(path.dirname(dir));

  await options?.startAction?.();

  const response = await fetch(url);

  if (!response.ok) {
    await options?.failedAction?.(response);
    return;
  }

  const contentLengthStr = response.headers.get('content-length') as string;
  const length = parseInt(contentLengthStr, 10);
  let bytes = 0;
  // 创建可写流
  const fileStream = fs.createWriteStream(dir);

  // 使用流式读取
  const reader = response.body!.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      bytes += value.length;
      if (length) {
        await options?.progressAction?.(bytes, length);
      }

      // 写入文件
      await new Promise((resolve, reject) => {
        fileStream.write(value, (err) => {
          if (err) reject(err);
          else resolve(null);
        });
      });
    }

    // 关闭流
    await new Promise((resolve, reject) => {
      fileStream.end((err: any) => {
        if (err) reject(err);
        else resolve(null);
      });
    });

    await options?.finishAction?.();
  } catch (err) {
    fileStream.destroy();
    await options?.errorAction?.(err);
  }
}

export async function listDirs<T = Dirent>(
  dir: string,
  map?: (dirent: Dirent) => T,
): Promise<T[]> {
  const entries = (
    await fs.promises.readdir(dir, { withFileTypes: true })
  ).filter((entry) => entry.isDirectory());
  return map ? entries.map(map) : (entries as T[]);
}

export async function listFiles<T = Dirent>(
  dir: string,
  map?: (dirent: Dirent) => T,
): Promise<T[]> {
  const entries = (
    await fs.promises.readdir(dir, { withFileTypes: true })
  ).filter((entry) => entry.isFile());
  return map ? entries.map(map) : (entries as T[]);
}

export async function writeFile(
  file: string,
  text:
    | string
    | NodeJS.ArrayBufferView
    | Iterable<string | NodeJS.ArrayBufferView>
    | AsyncIterable<string | NodeJS.ArrayBufferView>,
) {
  await mkdir(path.dirname(file));
  await fileUtils.fs.writeFile(file, text);
}

export async function copy(from: string, to: string) {
  // 确保目标目录存在
  await mkdir(path.dirname(to));
  // 使用流式传输
  const rs = fs.createReadStream(from);
  const ws = fs.createWriteStream(to);
  await stream.pipeline(rs, ws);
}

/**
 * 一次性流，用于导出小文件
 * @param action
 */
export function createOnceStream(
  action: (controller: ReadableStreamDefaultController<any>) => Promise<void>,
) {
  return new ReadableStream({
    async start(controller) {
      await action(controller);
      controller.close();
    },
  });
}

export function execute(cmd: string, options?: ExecOptionsWithStringEncoding) {
  return new Promise<{ stdout?: string; stderr?: string }>(
    (resolve, reject) => {
      exec(cmd, options, (error, stdout, stderr) => {
        if (error) reject(error);
        else
          resolve({
            stdout: stdout as string,
            stderr: stderr as string,
          });
      });
    },
  );
}

export const fileUtils = {
  exists,
  mkdir,
  copy,
  download,
  fs: fs.promises,
  execute,
  listDirs,
  listFiles,
  writeFile,
  createOnceStream,
};
