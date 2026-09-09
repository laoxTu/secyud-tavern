export interface Macro {
  // 这个用于去重
  code: string;
  key: string;
  value: string;
  // 这个宏是否为json变量
  json: boolean;
  multiple: boolean;
  hidden: boolean;
}

const defaultEntry: Macro = {
  code: 'macro',
  key: 'macro',
  json: false,
  multiple: false,
  hidden: false,
  value: '',
};
export const macros = {
  default: defaultEntry,
  name: 'macro',
  plural: 'macros',
};
