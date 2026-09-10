import { Entity } from '@/database';

export interface SettingModel<T = any> extends Entity {
  data: T | null;
}

export interface ProxyParam {
  method?: string;
  url: string;
  body?: any;
  ignore?: boolean;
  headers?: Record<string, string>;
}

export const config = {
  dataDir: 'data',
};
