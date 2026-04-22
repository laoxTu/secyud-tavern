// db/repositories/preset-repository.ts
import {db} from "@/db";
import {presetEntries, presets} from "../schema/presets";
import {and, eq, sql} from "drizzle-orm";
import type {PageOptions, PagedResult} from "@/models/common-types";

export type PresetEntity = typeof presets.$inferSelect;
export type PresetEntryEntity = typeof presetEntries.$inferSelect;

export const presetRepository = {

    get: async (id: string): Promise<PresetEntity | null> => {
        const data =
            await db.select().from(presets).where(eq(presets.id, id)).get();
        return data ?? null;
    },

    getList: async (options: PageOptions): Promise<PagedResult<PresetEntity>> => {
        const {page, pageSize, search} = options;
        const offset = (page - 1) * pageSize;

        const conditions = [];

        if (search) {
            const searchPattern = `%${search}%`;
            const whereClause = sql`(${presets.name} LIKE ${searchPattern})`;
            conditions.push(whereClause)
        }

        const [countResult] = await db
            .select({count: sql<number>`count(*)`})
            .from(presets)
            .where(and(...conditions));
        const totalCount = Number(countResult.count);

        const data = await db
            .select()
            .from(presets)
            .where(and(...conditions))
            .limit(pageSize)
            .offset(offset);

        return {data, totalCount};
    },

    getEntries: async (presetId: string, type: string, options: PageOptions): Promise<PagedResult<PresetEntryEntity>> => {
        const {page, pageSize, search} = options;
        const offset = (page - 1) * pageSize;

        const conditions = [
            eq(presetEntries.presetId, presetId),
            eq(presetEntries.entryType, type),
        ];

        if (search) {
            const searchPattern = `%${search}%`;
            const whereClause = sql`(
                    ${presetEntries.entryId} LIKE ${searchPattern}
                )`;
            conditions.push(whereClause);
        }

        const [countResult] = await db
            .select({count: sql<number>`count(*)`})
            .from(presetEntries)
            .where(and(...conditions));
        const totalCount = Number(countResult.count);

        const data = await db
            .select()
            .from(presetEntries)
            .where(and(...conditions))
            .limit(pageSize)
            .offset(offset);

        return {data, totalCount};
    },

    create: async (data: PresetEntity) => {
        await db
            .insert(presets)
            .values(data);
        return data.id;
    },

    update: async (id: string, data: Partial<PresetEntity>) => {
        const updateData: Record<string, unknown> = {
            updatedAt: new Date().toISOString(),
        };
        if (data.name !== undefined) updateData.name = data.name;
        if (data.content !== undefined) updateData.content = data.content;

        await db
            .update(presets)
            .set(updateData)
            .where(eq(presets.id, id));
        return id;
    },

    delete: async (id: string) => {
        await db
            .delete(presets)
            .where(eq(presets.id, id));
    },
};