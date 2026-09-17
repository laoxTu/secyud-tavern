import { Entity, NameValue, Properties } from '@/database';

// ComfyUI 工作流
export interface ComfyUIWorkflow extends Entity, Properties {
  // 工作流名称
  name: string;
  // 简要介绍
  description?: string;
  // 工作流内容 导出api格式的json文件
  content?: string;
}

export interface ComfyUIWorkflowRequestParam {
  fuzzy?: string;
}

/**
 * Workflow的内容格式，方便解析
 */
export interface ComfyUIWorkflowInput {
  [key: string]: {
    inputs: Record<string, number | string | boolean | [string, number] | any>;
    class_type: string;
    _meta: {
      title: string;
    };
  };
}

/**
 * 工作流参数，可以自定义参数
 */
export interface ComfyUIParam<T = any> {
  // 工作流ID
  masterId: string;
  sequence: number;
  // 类型
  type: string;
  // 名称用于在生图选项中作为标题
  name: string;
  // 配置
  config: T;
}

export interface ComfyUIParamClipboard {
  type: 'comfyui_param';
  masterId: string;
  sequence: number;
  param: Partial<ComfyUIParam>;
}

export interface ComfyUIParamRequestParam {
  filter?: string;
}

const defaultWorkflow: ComfyUIWorkflow = {
  id: '',
  name: '',
};

export const workflow = {
  toNameValue(item: ComfyUIWorkflow): NameValue {
    return {
      name: `${item.name}-${item.id}`,
      value: item.id,
    };
  },
  default: defaultWorkflow,
  name: 'comfyui.workflow',
};
