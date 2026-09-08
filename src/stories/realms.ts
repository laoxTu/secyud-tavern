import { Entity, Entries, Properties } from '@/database';
import { Model } from '@/models';
import { Preset } from '@/presets';
import { ToolCall } from '@/tools';
import { Operation } from '@/utils/json-patch';

export interface RealmMessage extends Properties {
  // 消息内容
  content: string;
  // 变量操作
  variables: Operation[];
}

// user 提示词
export interface RealmPrompt extends RealmMessage {}

// 输出
export interface RealmOutput extends RealmMessage {
  // 思考内容
  thought: string;
  // 工具调用
  callings?: ToolCall[];
}

export interface RealmHistory {
  masterId: string;
  sequence: number;
  summary: boolean;
  variables: Record<string, any>;
  prompts: RealmPrompt[];
  output: number;
  outputs: RealmOutput[][];
}

/**
 * realm 领域，王国
 * 描述进入游玩的界限
 * 由故事映射而来
 */
export interface Realm extends Entity, Properties, Entries {
  // 是否初始化
  initialized?: boolean;
  // 名称，用于显示
  name: string;
  // 历史，主要上下文
  histories: (RealmHistory | null)[];
  // 使用的模型
  model: Model;
  // 使用的预设
  presets: Preset[];
  context?: Record<string, any>;
}

export interface RealmContext extends Properties {
  realm: Realm;
}
