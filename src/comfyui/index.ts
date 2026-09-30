// ComfyUI 模型
import { model } from './model';
import { paint } from './tool';
import { workflow } from './workflow';

export type * from './model';
export type * from './tool';
export type * from './workflow';

export interface ComfyUIModelSetting {
  // comfyui 主机地址
  url: string;
  // 自身的client id，作用未知
  client: string;
  // 本地的模型目录，下载用
  directory: string;
}
const defaultSetting: ComfyUIModelSetting = {
  directory: '/home/user/comfyui/models',
  client: 'secyud-tavern',
  url: 'http://localhost:8188',
};

export const comfyuis = {
  name: 'comfyui',
  model,
  workflow,
  paint,
  setting: {
    default: defaultSetting,
  },
};
