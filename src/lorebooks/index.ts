export interface Lorebook<TExpression = any> {
  // 编码，去重用
  code: string;
  // 内容类型 可不用
  type: string;
  // 匹配类型
  match: string;
  // 匹配表达式
  expression: TExpression;
  // 世界书内容
  content: string;
  // 优先级, 表示插入顺序
  priority: number;
  // 层级，表示插入位置
  layer: number;
  role: 'assistant' | 'user' | 'system' | 'knowledge';
}

const defaultEntry: Lorebook = {
  code: '',
  content: '',
  layer: 100,
  expression: {},
  match: 'always',
  priority: 0,
  role: 'knowledge',
  type: 'plaintext',
};

function sequence(item: Lorebook) {
  return item.layer * 10000 + item.priority;
}

function compare(lft: Lorebook, rht: Lorebook) {
  return sequence(lft) - sequence(rht);
}

export const lorebooks = {
  default: defaultEntry,
  name: 'lorebook',
  plural: 'lorebooks',
  sequence,
  compare,
};
