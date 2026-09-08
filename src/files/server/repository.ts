import { readFile, unlink } from 'node:fs/promises';

import crypto from 'crypto';
import { and, eq, SQL } from 'drizzle-orm';
import { writeFile } from 'fs/promises';
import { v4 } from 'uuid';

import { DataRequest, InDto } from '@/database';
import { databases } from '@/database/server';
import { FileModel, FileRequestParam } from '@/files';
import { config } from '@/global';
import { checker } from '@/interceptors';
import { arrUtils } from '@/utils';
import { fileUtils } from '@/utils/server/file';

import { fileSchema, FileTable } from './schema';

import { FileModelWithBuffer } from '.';

const { db } = databases;

const filesDir = arrUtils.joinPath(process.cwd(), config.dataDir);

export const repository = {
  create: async (dto: InDto<FileModelWithBuffer>) => {
    // 创建时通过hash查询是否有重复文件，如果有，直接返回。
    // 从理论上两个文件不可能重复，但业务上存在用户重复导入的可能。
    const hash = crypto.createHash('sha256').update(dto.buffer).digest('hex');
    const entity = await db
      .select()
      .from(fileSchema)
      .where(eq(fileSchema.hash, hash))
      .get({ id: fileSchema.id });
    if (entity) return entity.id;
    // 保存文件，使用无后缀名的guid格式文件，方便访问
    const id = v4();
    const dirPath = arrUtils.joinPath(filesDir, dto.type);
    await fileUtils.mkdir(dirPath);
    const filePath = arrUtils.joinPath(dirPath, id);
    // 保存文件
    await writeFile(filePath, dto.buffer);
    await db.insert(fileSchema).values({
      id,
      hash,
      type: dto.type,
      args: dto.args,
    });

    return id;
  },
  get: async (id: string): Promise<FileModelWithBuffer> => {
    const entity = checker.notNullEntity(
      id,
      await databases.get<FileModel>(fileSchema, id),
      'default.file',
    );

    const filePath = arrUtils.joinPath(filesDir, entity.type, id);
    const buffer = await readFile(filePath);
    return {
      ...entity,
      buffer,
    };
  },
  delete: async (id: string) => {
    const entity = checker.notNullEntity(
      id,
      await databases.get<FileModel>(fileSchema, id),
      'default.file',
    );
    const filePath = arrUtils.joinPath(filesDir, entity.type, id);
    try {
      await unlink(filePath);
      console.log(`file deleted: ${filePath}`);
    } catch (error) {
      // 文件不存在时，记录日志但不中断删除流程
      console.warn(`file not exist: ${filePath}`);
    }
    await databases.delete(fileSchema, id);
  },
  async list(request: DataRequest<FileRequestParam>) {
    return await databases.query<FileModel, FileTable>(
      fileSchema,
      request,
      (t) => {
        const condition: SQL[] = [];
        if (request.search) {
          const { type } = request.search;
          if (type) {
            condition.push(eq(t.type, type));
          }
        }

        return condition.length ? and(...condition) : undefined;
      },
      (t) => t.id,
      (t) => ({
        id: t.id,
        type: t.type,
        args: t.args,
      }),
    );
  },
};
