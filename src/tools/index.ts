export interface Tool<T = any> {
  type: string;
  // 绑定同名宏，宏的状态会和工具同步
  macro?: boolean;
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
  macro: false,
  config: {},
};

export const tools = {
  default: defaultValue,
  name: 'tool',
  plural: 'tools',
};
