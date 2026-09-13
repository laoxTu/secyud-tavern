import { Entity, NameValue, Properties } from '@/database';

export interface Model extends Entity, Properties {
  // 名称，用于展示
  name: string;
  // 流式传输
  stream: boolean;
  // 模型供应者/模型引擎
  engine?: string;
  // 构造方式
  builder: string;
  // 单轮调用次数限制
  // 模型调用包含工具时会多次调用
  iterations: number;
  // api key secret
  key?: string;
  iv?: Buffer;
  properties?: Record<string, any> & ModelProperty;
}
/**
 * 这里把设置放到动态模型设置
 * 不增加字段了
 * 而且区段使用分段
 */
export interface ModelProperty {
  retry: {
    /**
     * 重试间隔，当流式返回超出
     * 此间隔即会重试，推荐5s
     */
    interval: number;
    /**
     * 重试最大次数，单次请求失败
     * 重试的最大次数，推荐2-3次
     */
    max: number;
  };
}

export interface ModelSetting {
  /**
   * 默认模型设置
   */
  model: NameValue | null;
}

export interface ModelRequestParam {
  fuzzy?: string | null;
}

export const models = {
  toNameValue(model: Model): NameValue {
    return {
      name: model.name,
      value: model.id,
    };
  },
  state: {
    setting: 'model_setting',
  },
  names: {
    config: 'config',
    options: 'option',
  },
};
