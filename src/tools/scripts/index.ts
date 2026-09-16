export interface ScriptConfig {
  code: string;
  script?: string;
  schema?: string;
  description?: string;
  // 引入doc
  enableDoc?: boolean;
  // 引入变量
  enableVariable?: boolean;
}

export const scripts = {
  name: 'script',
};
