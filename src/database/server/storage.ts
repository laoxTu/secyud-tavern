import { Entries } from '@/database';
import { Registerable } from '@/plugins';

export interface Criteria {
  filter?: string;
  sorter?: string;
}

export interface Storage<TEntity extends Entries> extends Registerable {
  load: (model: TEntity) => Promise<void>;
  save: (model: TEntity) => Promise<void>;
  criteria: (entry: any) => Criteria;
}

export interface StorageManager<TEntity extends Entries = any> {
  load: (model: TEntity) => Promise<void>;
  save: (model: TEntity) => Promise<void>;
  criteria: (type: string, entry: any) => Criteria;
}
