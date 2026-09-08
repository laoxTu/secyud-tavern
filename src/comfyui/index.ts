// ComfyUI 模型
import { Entity, NameValue, Properties } from '@/database';

export interface ComfyUIModelSetting {
  // comfyui 主机地址
  url: string;
  // 自身的client id，作用未知
  client: string;
  // 本地的模型目录，下载用
  directory: string;
}

export interface ComfyUIModel extends Entity, Properties {
  // 模型编码，一般是模型下载后的文件名
  code: string;
  // 模型名称，一般是网站介绍页的名称，可能和code相同
  name: string;
  // 类型 lora等
  type: string;
  // 封面，上传图片或者自定义源
  cover?: string;
  // 模型本地下载路径
  path: string;
  // 模型地址，可以进入外链
  url?: string;
  // 模型介绍
  html?: string;
  // 基础模型
  model?: string;
  // 下载地址
  download?: string;
  // 导入器
  importer?: string;
}

export interface ComfyUIModelRequestParam {
  fuzzy?: string;
  types?: string[];
}

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

const defaultModel: ComfyUIModel = {
  code: '',
  id: '',
  name: '',
  path: '',
  type: 'lora',
};
const defaultWorkflow: ComfyUIWorkflow = {
  id: '',
  name: '',
};

export const comfyuis = {
  name: 'comfyui',
  model: {
    toNameValue(item: ComfyUIModel): NameValue {
      return {
        name: item.path,
        value: item.id,
      };
    },
    default: defaultModel,
    name: 'comfyui.model',
    setting: 'comfyui-model-setting',
    types: ['vae', 'diffusion_model', 'lora', 'text_encoder', 'checkpoint'],
  },
  workflow: {
    toNameValue(item: ComfyUIWorkflow): NameValue {
      return {
        name: item.name,
        value: item.id,
      };
    },
    default: defaultWorkflow,
    name: 'comfyui.workflow',
  },
};
