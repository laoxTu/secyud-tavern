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

export const forms = {
  file(data: FormData, name: string) {
    return data.get(name) as File;
  },
  int(data: FormData, name: string) {
    return parseInt(data.get(name) as string);
  },
  float(data: FormData, name: string) {
    return parseFloat(data.get(name) as string);
  },
  str(data: FormData, name: string) {
    return data.get(name) as string;
  },
  bool(data: FormData, name: string) {
    return !!data.get(name);
  },
  strs(data: FormData, name: string) {
    return data.getAll(name) as string[];
  },
  ints(data: FormData, name: string) {
    return data.getAll(name).map((u) => parseInt(u as string));
  },
};
