export interface Tool<T = any> {
  type: string;
  config: T;
}

export interface ToolCall {
  // 调用索引
  index: number;
  // 调用id
  id: string;
  // 调用工具名
  name: string;
  // 调用参数
  arguments: string;
  result?: string;
}

const defaultValue: Tool = {
  type: 'variable',
  config: {},
};

export const tools = {
  default: defaultValue,
  name: 'tool',
  plural: 'tools',
};
