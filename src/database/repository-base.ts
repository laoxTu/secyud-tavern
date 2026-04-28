// src/database/repository-base.ts
import {databaseManager} from "./index";
import {and, eq, SQL, sql} from "drizzle-orm";
import type {PagedResult, PageOptions} from "@/models/common";
import {BaseEntity} from "./entity-base";
import {SQLiteTableWithColumns} from "drizzle-orm/sqlite-core";
import {BaseModel} from "@/models/require";
import {v4 as uuidv4} from 'uuid';
import {BusinessError} from "@/business";

const db = databaseManager.db;

export function createRepository<TModel extends BaseModel, TMaster extends BaseEntity>(
    masters: SQLiteTableWithColumns<any>,
    entries: SQLiteTableWithColumns<any>,
    loadModel: (model: TModel) => Promise<void>,
    saveModel: (model: TModel) => Promise<void>,
    mapToEntity: ((entity: Partial<TModel>) => Partial<TMaster>) | undefined = undefined,
    mapToModel: ((entity: Partial<TMaster>) => Partial<TModel>) | undefined = undefined) {

    const repository = {

        get: async (id: string, withDetails: boolean = false): Promise<TModel | null> => {
            const entity =
                await db.select().from(masters).where(eq(masters.id, id)).get();
            if (!entity) return null;

            const model = {
                id: entity.id,
                name: entity.name,
                content: JSON.parse(entity.content),
                requires: entity.requires,
                ...(mapToModel?.(entity) ?? {})
            } as TModel;


            if (withDetails) {
                model.entries = {};
                await loadModel(model);
            }

            return model;
        },

        getList: async (options: PageOptions, conditions: (table: TMaster) => SQL | SQL[]): Promise<PagedResult<TModel>> => {
            const {page = 0, pageSize = 20} = options;
            const offset = page * pageSize;

            const whereClause = conditions(masters);
            const condition = whereClause instanceof SQL ? whereClause : and(...whereClause);

            const [countResult] = await db
                .select({count: sql<number>`count(*)`})
                .from(masters)
                .where(condition);
            const totalCount = Number(countResult.count);

            const entities = await db
                .select()
                .from(masters)
                .where(condition)
                .limit(pageSize)
                .offset(offset);

            const models =
                entities.map(entity => ({
                    ...(mapToModel?.(entity) ?? {}),
                    id: entity.id,
                    name: entity.name,
                    content: JSON.parse(entity.content),
                } as TModel));

            return {data: models, totalCount};
        },

        create: async (model: TModel) => {
            const entity = {
                id: model.id == "" ? uuidv4() : model.id,
                name: model.name,
                content: JSON.stringify(model.content),
                requires: model.requires,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...(mapToEntity?.(model) ?? {})
            }

            await db
                .insert(masters)
                .values(entity);

            if (model.entries) {
                await saveModel(model);
            }
            return entity.id;
        },

        update: async (id: string, model: Partial<TModel>) => {
            const exist = await repository.get(id);
            if (!exist)
                throw new BusinessError('update entity not found', "default.entity_not_found")
                    .withValue("id", id);

            const updateData: Record<string, unknown> = {
                updatedAt: new Date().toISOString(),
                ...(mapToEntity?.(model) ?? {})
            };

            if (model.name !== undefined) updateData.name = model.name;
            if (model.content !== undefined) updateData.content = JSON.stringify({
                ...exist.content,
                ...model.content
            });
            if (model.requires !== undefined) {
                const isChanged =
                    model.requires.length !== exist.requires.length ||
                    model.requires.some((req, i) =>
                        req.code !== exist.requires[i]?.code ||
                        req.version !== exist.requires[i]?.version
                    );

                if (isChanged) {
                    updateData.requires = model.requires;
                }
            }

            await db
                .update(masters)
                .set(updateData)
                .where(eq(masters.id, id));
        },

        delete: async (id: string) => {
            await db
                .delete(masters)
                .where(eq(masters.id, id));
        },

        /**
         * 检查记录是否存在（使用 lambda 构建条件）
         * @param conditions Lambda 函数，传入表对象，返回 SQL 条件
         * @example
         * await repository.exist((t) => eq(t.name, 'test'))
         * await repository.exist((t) => and(eq(t.name, 'test'), eq(t.status, 'active')))
         */
        exist: async (conditions: (table: TMaster) => SQL | SQL[]): Promise<boolean> => {
            const whereClause = conditions(masters);
            const condition = whereClause instanceof SQL ? whereClause : and(...whereClause);

            const result = await db
                .select({count: sql<number>`count(*)`})
                .from(masters)
                .where(condition)
                .get();

            return Number(result?.count ?? 0) > 0;
        },

        entry: {

            getList: async (masterId: string, type: string, options: PageOptions = {},
                            conditions: ((table: TMaster) => SQL | SQL[]) | undefined = undefined): Promise<PagedResult<any>> => {
                const {page, pageSize} = options;

                const whereClause = conditions?.(masters);
                const condition = whereClause ? (whereClause instanceof SQL ? [whereClause] : whereClause) : [];

                condition.push(eq(entries.masterId, masterId));
                condition.push(eq(entries.entryType, type));


                const [countResult] = await db
                    .select({count: sql<number>`count(*)`})
                    .from(entries)
                    .where(and(...condition));
                const totalCount = Number(countResult.count);

                let query: any = db
                    .select()
                    .from(entries)
                    .where(and(...condition));

                if (pageSize) {
                    query = query.limit(pageSize);

                    if (page) {
                        query = query.limit(page * pageSize);
                    }
                }
                const data = (await query).map((u: { content: string; }) => JSON.parse(u.content));

                return {data, totalCount};
            },

            batchCreate: async (masterId: string, type: string, entryList: any[]) => {
                await db
                    .insert(entries)
                    .values(entryList.map((e, i) => ({
                        masterId: masterId,
                        entryType: type,
                        entryId: i + 1,
                        content: JSON.stringify(e),
                    })));
            },

            create: async (masterId: string, type: string, entry: any) => {
                const maxEntryId = await db
                    .select({
                        id: sql<number>`max(${entries.entryId})`
                    })
                    .from(entries)
                    .where(and(
                        eq(entries.masterId, masterId),
                        eq(entries.entryType, type),
                    ));

                const entryId = maxEntryId[0].id + 1;
                await db
                    .insert(entries)
                    .values({
                        masterId: masterId,
                        entryType: type,
                        entryId: entryId,
                        content: JSON.stringify(entry),
                    });

                return entryId;
            },

            update: async (masterId: string, type: string, entryId: number, entry: any) => {
                if (entry === undefined) return entryId;

                const updateData: Record<string, unknown> = {
                    updatedAt: new Date().toISOString(),
                    content: JSON.stringify(entry),
                };

                await db
                    .update(entries)
                    .set(updateData)
                    .where(and(
                        eq(entries.masterId, masterId),
                        eq(entries.entryType, type),
                        eq(entries.entryId, entryId),
                    ));
            },

            delete: async (masterId: string, type: string, entryId: number) => {
                await db
                    .delete(entries)
                    .where(and(
                        eq(entries.masterId, masterId),
                        eq(entries.entryType, type),
                        eq(entries.entryId, entryId),
                    ));
            },
        },
    };

    return repository;
}