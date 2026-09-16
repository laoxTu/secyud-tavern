import { Entity, NameValue, Properties } from '@/database';

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
  fuzzy?: string | null;
  types?: string[];
}

const defaultModel: ComfyUIModel = {
  code: '',
  id: '',
  name: '',
  path: '',
  type: 'lora',
};

export const model = {
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
};
