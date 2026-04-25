// src/database/repository-base.ts
import {db} from "./index";
import {and, eq, sql} from "drizzle-orm";
import type {PagedResult, PageOptions} from "@/models/common";
import {BaseEntity} from "./entity-base";
import {SQLiteTableWithColumns} from "drizzle-orm/sqlite-core";
import {BaseModel, RequireModel} from "@/models/require";

export function createRepository<TModel extends BaseModel, TMaster extends BaseEntity>(
    masters: SQLiteTableWithColumns<any>,
    entries: SQLiteTableWithColumns<any>,
    requires: SQLiteTableWithColumns<any>,
    loadModel: (model: TModel) => Promise<void>,
    saveModel: (model: TModel) => Promise<void>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mapToEntity: (entity: Partial<TModel>) => Partial<TMaster> = (_e) => ({}),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mapToModel: (entity: Partial<TMaster>) => Partial<TModel> = (_m) => ({})) {

    const repository = {

        get: async (id: string, withDetails: boolean = false): Promise<TModel | null> => {
            const entity =
                await db.select().from(masters).where(eq(masters.id, id)).get();
            if (!entity) return null;

            const model = {
                id: entity.id,
                name: entity.name,
                content: JSON.parse(entity.content),
                requires: await repository.require.get(id),
                ...mapToModel(entity)
            } as TModel;


            if (withDetails) {
                model.entries = {};
                await loadModel(model);
            }

            return model;
        },

        getList: async (options: PageOptions): Promise<PagedResult<TModel>> => {
            const {page = 0, pageSize = 20, search} = options;
            const offset = page * pageSize;

            const conditions = [];

            if (search) {
                const searchPattern = `%${search}%`;
                const whereClause = sql`(${masters.name} LIKE ${searchPattern})`;
                conditions.push(whereClause)
            }

            const [countResult] = await db
                .select({count: sql<number>`count(*)`})
                .from(masters)
                .where(and(...conditions));
            const totalCount = Number(countResult.count);

            const entities = await db
                .select()
                .from(masters)
                .where(and(...conditions))
                .limit(pageSize)
                .offset(offset);

            const models =
                entities.map(entity => ({
                    ...mapToModel(entity),
                    id: entity.id,
                    name: entity.name,
                    content: JSON.parse(entity.content),
                } as TModel));

            return {data: models, totalCount};
        },

        create: async (model: TModel) => {
            const entity = {
                id: model.id,
                name: model.name,
                content: JSON.stringify(model.content),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...mapToEntity(model)
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
            const updateData: Record<string, unknown> = {
                updatedAt: new Date().toISOString(),
                ...mapToEntity(model)
            };
            if (model.name !== undefined) updateData.name = model.name;
            if (model.content !== undefined) updateData.content = JSON.stringify(model.content);

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

        require: {

            get: async (masterId: string): Promise<RequireModel[]> => {
                const entities = await db
                    .select()
                    .from(requires)
                    .where(eq(requires.masterId, masterId))
                    .all()
                return entities.map(u => ({
                    requireId: u.requireId,
                    version: u.version,
                }));
            },

            set: async (masterId: string, data: RequireModel[]): Promise<void> => {
                await db
                    .delete(requires)
                    .where(eq(entries.masterId, masterId),);

                await db
                    .insert(requires)
                    .values(data.map(require => ({
                        masterId: masterId,
                        requireId: require.requireId,
                        version: require.version,
                    })));
            },
        },

        entry: {

            getList: async (masterId: string, type: string, options: PageOptions): Promise<PagedResult<any>> => {
                const {page, pageSize, search} = options;

                const conditions = [
                    eq(entries.masterId, masterId),
                    eq(entries.entryType, type),
                ];

                if (search) {
                    const searchPattern = `%${search}%`;
                    const whereClause = sql`(
                    ${entries.entryId} LIKE ${searchPattern}
                )`;
                    conditions.push(whereClause);
                }

                const [countResult] = await db
                    .select({count: sql<number>`count(*)`})
                    .from(entries)
                    .where(and(...conditions));
                const totalCount = Number(countResult.count);

                let query: any = db
                    .select()
                    .from(entries)
                    .where(and(...conditions));

                if (pageSize) {
                    query = query.limit(pageSize);

                    if (page) {
                        query = query.limit(page * pageSize);
                    }
                }
                const data = (await query).map((u: { content: string; }) => JSON.parse(u.content));

                return {data, totalCount};
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

            batchDelete: async (masterId: string) => {
                await db
                    .delete(entries)
                    .where(and(
                        eq(entries.masterId, masterId),
                    ));
            },
        },
    };

    return repository;
}