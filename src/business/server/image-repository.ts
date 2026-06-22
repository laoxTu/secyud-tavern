import {imageFiles} from "@/business/server/db-entities";
import {databaseManager} from "@/business/server/database";
import {eq} from "drizzle-orm";
import crypto from 'crypto';
import {v4 as uuidv4, validate} from 'uuid';
import {mkdir, writeFile} from 'fs/promises';
import path from "path";
import {readFile, unlink} from "node:fs/promises";

const UPLOAD_DIR = path.join(process.cwd(), 'database/images');

async function ensureUploadDir() {
    try {
        await mkdir(UPLOAD_DIR, {recursive: true});
    } catch (error) {
    }
}

const db = databaseManager.db;
export const imageRepository = {
    create: async (buffer: Buffer, type: string) => {
        const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
        const entity =
            await db.select().from(imageFiles)
                .where(eq(imageFiles.sha256, sha256))
                .get();
        if (entity) {
            return entity.id;
        }

        const id = uuidv4();
        await ensureUploadDir();
        const filePath = path.join(UPLOAD_DIR, id);
        // 保存文件
        await writeFile(filePath, buffer);
        await db
            .insert(imageFiles)
            .values({
                id,
                sha256,
                type
            });

        return id;
    },
    get: async (id: string) => {
        if (!validate(id)) {
            throw new Error('id must be a valid uuid');
        }

        const filePath = path.join(UPLOAD_DIR, id);
        const buffer = await readFile(filePath);
        const entity =
            await db.select().from(imageFiles)
                .where(eq(imageFiles.id, id)).get()
        ;
        return {
            buffer,
            ...entity,
        };
    },
    delete: async (id: string) => {
        const filePath = path.join(UPLOAD_DIR, id);
        try {
            await unlink(filePath);
            console.log(`file deleted: ${filePath}`);
        } catch (error) {
            // 文件不存在时，记录日志但不中断删除流程
            console.warn(`file not exist: ${filePath}`);
        }
        await db
            .delete(imageFiles)
            .where(eq(imageFiles.id, id));
    }
};