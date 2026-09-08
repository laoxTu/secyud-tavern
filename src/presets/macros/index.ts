export interface Macro {
  // 这个用于去重
  code: string;
  key: string;
  value: string;
  multiple: boolean;
  hidden: boolean;
}

const defaultEntry: Macro = {
  code: 'macro',
  key: 'macro',
  multiple: false,
  hidden: false,
  value: '',
};
export const macros = {
  default: defaultEntry,
  name: 'macro',
  plural: 'macros',
};
