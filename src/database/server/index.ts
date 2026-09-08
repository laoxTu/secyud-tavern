import { count, eq, exists, SQL } from 'drizzle-orm';
import { SQLiteColumn } from 'drizzle-orm/sqlite-core';
import type { SelectedFields } from 'drizzle-orm/sqlite-core/query-builders/select.types';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core/table';

import { DataRequest, DataResponse, Entity } from '..';

import { dbProvider } from './provider';

const { db } = dbProvider;

export type * from './storage';
export type AnyQuery = any;
export type EntityTable = SQLiteTable & { id: SQLiteColumn };

export const databases = {
  ...dbProvider,
  get: async <TEntity extends Entity, TTable extends EntityTable = EntityTable>(
    table: TTable,
    id: string,
    map?: (table: TTable) => SelectedFields,
  ) => {
    return (await (map ? db.select(map(table)) : db.select())
      .from(table)
      .where(eq(table.id, id))
      .get()) as TEntity | undefined;
  },
  delete: async <TTable extends EntityTable = EntityTable>(
    table: TTable,
    id: string,
  ) => {
    await db.delete(table).where(eq(table.id, id));
  },
  query: async <TEntity, TTable extends SQLiteTable = SQLiteTable>(
    table: TTable,
    request: DataRequest<any>,
    filter?: (table: TTable) => SQL | undefined,
    sorter?: (table: TTable) => SQL | SQLiteColumn | undefined,
    map?: (table: TTable) => SelectedFields,
  ): Promise<DataResponse<TEntity>> => {
    const { skip = 0, size = 20 } = request;

    const filterValue = filter?.(table);
    const sorterValue = sorter?.(table);

    let countQuery: AnyQuery = db.select({ count: count() }).from(table);
    let itemsQuery: AnyQuery = map
      ? db.select(map(table)).from(table)
      : db.select().from(table);
    if (filterValue) {
      countQuery = countQuery.where(filterValue);
      itemsQuery = itemsQuery.where(filterValue);
    }
    if (sorterValue) {
      itemsQuery = itemsQuery.orderBy(sorterValue);
    }
    itemsQuery = itemsQuery.offset(skip).limit(size);
    const [[{ count: length }], items] = await Promise.all([
      countQuery,
      itemsQuery,
    ]);
    return { items: items as TEntity[], length };
  },
  exists: async <TTable extends SQLiteTable = SQLiteTable>(
    table: TTable,
    condition: (table: TTable) => SQL | undefined,
  ) => {
    const subQuery = db.select().from(table).where(condition(table));
    const result = await db
      .select({ exists: exists(subQuery) })
      .from(table) // 主查询的表可以任意，只要合法即可
      .limit(1);
    return !!result[0]?.exists;
  },
};
