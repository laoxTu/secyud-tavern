import {and, eq, like, SQL, sql} from "drizzle-orm";
import {SQLiteTableWithColumns} from "drizzle-orm/sqlite-core";
import {BaseEntity} from "./entities";
import {v4 as uuidv4, validate} from 'uuid';
import type {PagedResult, PageOptions} from "@/business/models";
import {BaseModel} from "@/business/models";
import {BusinessError} from "@/handler/models";
import {databaseManager} from "@/business/server/database";
import {mergeObjects} from "@/utils";

export type ConditionFunc = (table: any) => SQL;

export interface Repository<TModel> {
    get: (id: string, withDetails?: boolean, conditionFunc?: ConditionFunc) => Promise<TModel | null>,
    getList: (options: PageOptions, conditionFunc?: ConditionFunc) => Promise<PagedResult<TModel>>,
    create: (model: TModel) => Promise<TModel>,
    update: (id: string, model: Partial<TModel>) => Promise<TModel>,
    delete: (id: string) => Promise<void>,
    exist: (conditionFunc: ConditionFunc) => Promise<boolean>,
    entry: {
        getList: (masterId: string, type: string, options?: PageOptions) => Promise<PagedResult<any>>,
        batchCreate: (masterId: string, type: string, entryList: any[]) => Promise<void>,
        create: (masterId: string, type: string, entry: any) => Promise<number>,
        setDisabled: (masterId: string, type: string, entryId: number, disabled: boolean) => Promise<void>,
        update: (masterId: string, type: string, entryId: number, entry: any) => Promise<void>,
        delete: (masterId: string, type: string, entryId: number) => Promise<void>,
    }
}

export function createRepository<TModel extends BaseModel, TMaster extends BaseEntity>(
    masters: SQLiteTableWithColumns<any>,
    entries: SQLiteTableWithColumns<any>,
    loadModel: (model: TModel) => Promise<void>,
    saveModel: (model: TModel) => Promise<void>,
    bindSearch: (type: string, entry: any) => string,
    bindSorter: (type: string, entry: any) => string,
    mapToEntity: ((entity: Partial<TModel>) => Partial<TMaster>) | undefined = undefined,
    mapToModel: ((entity: Partial<TMaster>) => Partial<TModel>) | undefined = undefined): Repository<TModel> {

    const db = databaseManager.db;
    const repository: Repository<TModel> = {

        get: async (id: string, withDetails: boolean = false, conditionFunc?: ConditionFunc): Promise<TModel | null> => {

            const condition = conditionFunc?.(masters) ?? eq(masters.id, id);
            const entity =
                await db.select().from(masters)
                    .where(condition).get();
            if (!entity) return null;

            const model = {
                id: entity.id,
                name: entity.name,
                content: JSON.parse(entity.content),
                ...(mapToModel?.(entity) ?? {})
            } as TModel;


            if (withDetails) {
                model.entries = {};
                await loadModel(model);
            }

            return model;
        },

        getList: async (options: PageOptions, conditionFunc?: ConditionFunc): Promise<PagedResult<TModel>> => {
            const {page = 0, pageSize = 20} = options;
            const offset = page * pageSize;

            const condition = conditionFunc?.(masters);

            const [countResult] = await db
                .select({count: sql<number>`count(*)`})
                .from(masters)
                .where(condition);
            const totalCount = Number(countResult.count);

            const entities = await db
                .select()
                .from(masters)
                .where(condition)
                .orderBy(masters.id)
                .offset(offset)
                .limit(pageSize);

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
                id: validate(model.id) ? model.id : uuidv4(),
                name: model.name,
                content: JSON.stringify(model.content),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...(mapToEntity?.(model) ?? {})
            }

            const result = await db
                .insert(masters)
                .values(entity)
                .returning();

            if (model.entries) {
                model.id = entity.id;
                await saveModel(model);
            }

            const res = result[0];
            return {
                id: res.id,
                name: res.name,
                content: JSON.parse(res.content),
                ...(mapToModel?.(res as Partial<TMaster>) ?? {})
            } as TModel;
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

            if (model.name !== undefined)
                updateData.name = model.name;
            if (model.content !== undefined)
                updateData.content = mergeObjects(exist.content, model.content);

            const result = await db
                .update(masters)
                .set(updateData)
                .where(eq(masters.id, id))
                .returning();

            const res = result[0];
            return {
                id: res.id,
                name: res.name,
                content: JSON.parse(res.content),
                ...(mapToModel?.(res as Partial<TMaster>) ?? {})
            } as TModel;
        },

        delete: async (id: string) => {
            await db
                .delete(masters)
                .where(eq(masters.id, id));
        },

        /**
         * 检查记录是否存在（使用 lambda 构建条件）
         * @param conditionFunc Lambda 函数，传入表对象，返回 SQL 条件
         * @example
         * await repository.exist((t) => eq(t.name, 'test'))
         * await repository.exist((t) => and(eq(t.name, 'test'), eq(t.status, 'active')))
         */
        exist: async (conditionFunc: ConditionFunc): Promise<boolean> => {
            const condition = conditionFunc(masters);

            const result = await db
                .select({count: sql<number>`count(*)`})
                .from(masters)
                .where(condition)
                .get();

            return Number(result?.count ?? 0) > 0;
        },

        entry: {

            getList: async (masterId: string, type: string, options?: PageOptions): Promise<PagedResult<any>> => {
                const {page, pageSize, search} = options ?? {};

                const condition = [
                    eq(entries.masterId, masterId),
                    eq(entries.entryType, type)
                ];

                if (search && search != '') {
                    condition.push(like(entries.search, `%${search}%`))
                }


                const [countResult] = await db
                    .select({count: sql<number>`count(*)`})
                    .from(entries)
                    .where(and(...condition));
                const totalCount = Number(countResult.count);

                let query: any = db
                    .select()
                    .from(entries)
                    .where(and(...condition))
                    .orderBy(entries.sorter);

                if (pageSize) {
                    query = query.limit(pageSize);

                    if (page) {
                        query = query.offset(page * pageSize);
                    }
                }
                const data = (await query).map((u: { entryId: number, disabled: boolean, content: string; }) =>
                    ({
                        ...JSON.parse(u.content),
                        id: u.entryId,
                        disabled: u.disabled
                    })
                );

                return {data, totalCount};
            },

            batchCreate: async (masterId: string, type: string, entryList: any[]) => {
                await db
                    .insert(entries)
                    .values(entryList.map((e) => ({
                        masterId: masterId,
                        entryType: type,
                        entryId: e.id,
                        disabled: e.disabled,
                        search: bindSearch(type, e),
                        sorter: bindSorter(type, e),
                        content: JSON.stringify({
                            ...e,
                            id: undefined,
                            disabled: undefined
                        }),
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
                        disabled: false,
                        search: bindSearch(type, entry),
                        sorter: bindSorter(type, entry),
                        content: JSON.stringify({
                            ...entry,
                            id: undefined
                        }),
                    });

                return entryId;
            },

            setDisabled: async (masterId: string, type: string, entryId: number, disabled: boolean) => {
                const updateData: Record<string, unknown> = {
                    disabled: disabled,
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

            update: async (masterId: string, type: string, entryId: number, entry: any) => {
                if (entry === undefined) return;

                const updateData: Record<string, unknown> = {
                    updatedAt: new Date().toISOString(),
                    search: bindSearch(type, entry),
                    sorter: bindSorter(type, entry),
                    content: JSON.stringify({
                        ...entry,
                        id: undefined,
                        disabled: undefined,
                    }),
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