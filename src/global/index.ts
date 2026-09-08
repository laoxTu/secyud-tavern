import { Entity } from '@/database';

export interface SettingModel<T = any> extends Entity {
  data: T | null;
}

export const config = {
  dataDir: 'data',
};
