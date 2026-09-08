import { and, count, eq, like, sql, SQL } from 'drizzle-orm';
import {
  index,
  integer,
  primaryKey,
  SQLiteColumn,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';
import type { SelectedFields } from 'drizzle-orm/sqlite-core/query-builders/select.types';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core/table';

import {
  DataRequest,
  DataResponse,
  Entries,
  Entry,
  EntryRequestParam,
} from '@/database';
import { Registry } from '@/plugins';

import { dbProvider } from './provider';
import { Storage, StorageManager } from './storage';

import { AnyQuery } from '.';

const { db } = dbProvider;

export const storages = {
  createManager<TEntity extends Entries>(
    registry: Registry<Storage<TEntity>>,
  ): StorageManager<TEntity> {
    return {
      load: async (entity: TEntity) => {
        await registry.use(async (provider) => {
          await provider.load(entity);
        });
      },
      save: async (entity: TEntity) => {
        await registry.use(async (provider) => {
          await provider.save(entity);
        });
      },
      criteria: (type: string, entry: any) => {
        const storage = registry.record(type);
        return storage!.criteria(entry);
      },
    };
  },
};
export const json = <T = any>(name: string) =>
  text(name, { mode: 'json' }).$type<T>();
export const boolean = (name: string) =>
  integer(name, { mode: 'boolean' }).$type<boolean>();
export const foreignKey = (name: string, ref: () => SQLiteColumn) =>
  text(name).references(ref, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  });

export const schemas = {
  entry(name: string, ref: () => SQLiteColumn, extraColumns: any = {}) {
    return sqliteTable(
      name,
      {
        masterId: foreignKey('master_id', ref).notNull(),
        entryType: text('entry_type').notNull(),
        entryId: integer('entry_id').notNull(),
        name: text('name').notNull().default(''),
        filter: text('filter').notNull().default(''),
        sorter: text('sorter').notNull().default(''),
        ...extraColumns,
      },
      (table) => [
        primaryKey({
          columns: [table.masterId, table.entryType, table.entryId],
        }),
        index(`${name}_filter_idx`).on(table.filter),
        index(`${name}_sorter_idx`).on(table.sorter),
      ],
    );
  },
};

export const repositories = {
  entry<TEntry extends Entry, TTable extends SQLiteTable = SQLiteTable>(
    entryTable: TTable,
    manager: StorageManager,
    map: (table: TTable) => SelectedFields,
  ) {
    const table = entryTable as any;
    const getMaxEntryId = async (masterId: string, entryType: string) => {
      const [{ entryId }] = await db
        .select({
          entryId: sql<number>`max(${table.entryId})`,
        })
        .from(table)
        .where(
          and(eq(table.masterId, masterId), eq(table.entryType, entryType)),
        );
      return entryId ?? 0;
    };

    const list = async (
      id: string,
      request?: DataRequest<EntryRequestParam>,
    ): Promise<DataResponse<TEntry>> => {
      const { skip, size, search } = request ?? {};
      const { filter, entryType } = search ?? {};
      const conditions: SQL[] = [eq(table.masterId, id)];
      if (entryType) {
        conditions.push(eq(table.entryType, entryType));
      }
      if (filter) {
        conditions.push(like(table.filter, `%${filter}%`));
      }
      const condition = and(...conditions);

      const countQuery: AnyQuery = db
        .select({ count: count() })
        .from(table)
        .where(condition);
      let itemsQuery: AnyQuery = db
        .select({
          ...map(table),
          entryType: table.entryType,
          entryId: table.entryId,
          masterId: table.masterId,
        })
        .from(table)
        .where(condition)
        .orderBy(table.sorter);

      if (size) {
        itemsQuery = itemsQuery.offset(skip ?? 0).limit(size);
      }
      const [[{ count: length }], items] = await Promise.all([
        countQuery,
        itemsQuery,
      ]);
      return { items: items as TEntry[], length };
    };
    const make = async (
      masterId: string,
      entryType: string,
      entries: TEntry[],
    ) => {
      const entryId = (await getMaxEntryId(masterId, entryType)) + 1;
      await db.insert(table).values(
        entries.map(
          (e, i) =>
            ({
              ...e,
              ...manager.criteria(entryType, e),
              masterId,
              entryType,
              entryId: i + entryId,
            }) as any,
        ),
      );
    };
    const types = async (masterId: string): Promise<string[]> => {
      const result = await db
        .selectDistinct({ entryType: table.entryType })
        .from(table)
        .where(eq(table.masterId, masterId));
      return result.map((u) => u.entryType);
    };
    const get = async (
      masterId: string,
      entryType: string,
      entryId: number,
    ) => {
      const entry = await db
        .select({
          ...map(table),
          entryType: table.entryType,
          entryId: table.entryId,
          masterId: table.masterId,
        })
        .from(table)
        .where(
          and(
            eq(table.masterId, masterId),
            eq(table.entryType, entryType),
            eq(table.entryId, entryId),
          ),
        )
        .get();
      return entry as TEntry;
    };
    const add = async (masterId: string, entryType: string, entry: TEntry) => {
      const entryId = (await getMaxEntryId(masterId, entryType)) + 1;
      await db.insert(table).values({
        ...entry,
        ...manager.criteria(entryType, entry),
        masterId,
        entryType,
        entryId,
      });
      return entryId;
    };
    const set = async (
      masterId: string,
      entryType: string,
      entryId: number,
      entry: Partial<TEntry>,
    ) => {
      await db
        .update(table)
        .set({
          ...entry,
          ...manager.criteria(entryType, entry),
          masterId: undefined,
          entryType: undefined,
          entryId: undefined,
        })
        .where(
          and(
            eq(table.masterId, masterId),
            eq(table.entryType, entryType),
            eq(table.entryId, entryId),
          ),
        );
    };
    const del = async (
      masterId: string,
      entryType: string,
      entryId: number,
    ) => {
      await db
        .delete(table)
        .where(
          and(
            eq(table.masterId, masterId),
            eq(table.entryType, entryType),
            eq(table.entryId, entryId),
          ),
        );
    };

    return {
      list,
      make,
      types,
      get,
      add,
      set,
      del,
    };
  },
};
