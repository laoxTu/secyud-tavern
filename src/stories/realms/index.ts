import { Entity, Entries, Properties } from '@/database';
import { Model } from '@/models';
import { Preset } from '@/presets';
import { ToolCall } from '@/tools';
import { Operation } from '@/utils/json-patch';

// 输出
export interface RealmOutput extends Properties {
  content: string;
  // 思考内容
  thought: string;
  // 工具调用
  callings?: ToolCall[];
}

/**
 * 一个操作空间，是一连串的输出集合
 * operations 承载继承变量的变化
 * properties 是操作空间内的属性
 */
export interface RealmSpace extends Properties {
  // 工作区变量操作
  operations: Operation[];
  outputs: RealmOutput[];
}

/**
 * 一个历史包含输入和工作区集合
 */
export interface RealmHistory extends Properties {
  // 故事ID
  masterId: string;
  // 序号
  sequence: number;
  // 是否是汇总
  summary: boolean;
  // 消息内容
  content: string;
  // 工作区的继承初始变量
  variables: Record<string, any>;
  // 空间索引
  index: number;
  // 空间集合
  spaces: RealmSpace[];
  // 前端字段，是否改变
  changed?: boolean;
  // 前端字段，临时索引
  pos?: number;
}

/**
 * realm 领域，王国
 * 描述进入游玩的界限
 * 由故事映射而来
 */
export interface Realm extends Entity, Properties, Entries {
  // 名称，用于显示
  name: string;
  // 历史，主要上下文
  histories: (RealmHistory | null)[];
  // 使用的模型
  model: Model;
  // 使用的预设
  presets: Preset[];
  context?: Record<string, any>;
  changes: Record<number, RealmHistory>;
}

export interface RealmContext extends Properties {
  realm: Realm;
}
