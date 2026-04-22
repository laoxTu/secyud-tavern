// db/repositories/chat-repository.ts
import {db} from "@/db";
import {chatEntries, chats} from "../schema/chats";
import {and, eq, sql} from "drizzle-orm";
import type {PageOptions, PagedResult} from "@/models/common-types";

export type ChatEntity = typeof chats.$inferSelect;
export type ChatEntryEntity = typeof chatEntries.$inferSelect;

export const chatRepository = {

    get: async (id: string): Promise<ChatEntity | null> => {
        const data =
            await db.select().from(chats).where(eq(chats.id, id)).get();
        return data ?? null;
    },

    getList: async (options: PageOptions): Promise<PagedResult<ChatEntity>> => {
        const {page, pageSize, search} = options;
        const offset = (page - 1) * pageSize;

        const conditions = [];

        if (search) {
            const searchPattern = `%${search}%`;
            const whereClause = sql`(${chats.name} LIKE ${searchPattern})`;
            conditions.push(whereClause)
        }

        const [countResult] = await db
            .select({count: sql<number>`count(*)`})
            .from(chats)
            .where(and(...conditions));
        const totalCount = Number(countResult.count);

        const data = await db
            .select()
            .from(chats)
            .where(and(...conditions))
            .limit(pageSize)
            .offset(offset);

        return {data, totalCount};
    },

    getEntries: async (chatId: string, type: string, options: PageOptions): Promise<PagedResult<ChatEntryEntity>> => {
        const {page, pageSize, search} = options;
        const offset = (page - 1) * pageSize;

        const conditions = [
            eq(chatEntries.chatId, chatId),
            eq(chatEntries.entryType, type),
        ];

        if (search) {
            const searchPattern = `%${search}%`;
            const whereClause = sql`(
                    ${chatEntries.entryId} LIKE ${searchPattern}
                )`;
            conditions.push(whereClause);
        }

        const [countResult] = await db
            .select({count: sql<number>`count(*)`})
            .from(chatEntries)
            .where(and(...conditions));
        const totalCount = Number(countResult.count);

        const data = await db
            .select()
            .from(chatEntries)
            .where(and(...conditions))
            .limit(pageSize)
            .offset(offset);

        return {data, totalCount};
    },

    create: async (data: ChatEntity) => {
        await db
            .insert(chats)
            .values(data);
        return data.id;
    },

    update: async (id: string, data: Partial<ChatEntity>) => {
        const updateData: Record<string, unknown> = {
            updatedAt: new Date().toISOString(),
        };
        if (data.name !== undefined) updateData.name = data.name;
        if (data.content !== undefined) updateData.content = data.content;

        await db
            .update(chats)
            .set(updateData)
            .where(eq(chats.id, id));
        return id;
    },

    delete: async (id: string) => {
        await db
            .delete(chats)
            .where(eq(chats.id, id));
    },
};