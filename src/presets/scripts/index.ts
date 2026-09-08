export interface Script {
  code: string;
  content: string;
  priority: number;
  type: string;
}

const defaultEntry: Script = {
  code: '',
  content: '',
  priority: 100,
  type: 'text/css',
};

export const scripts = {
  name: 'script',
  plural: 'scripts',
  default: defaultEntry,
};
