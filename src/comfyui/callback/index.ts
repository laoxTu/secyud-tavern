/**
 * 回调，用于ComfyUI保存到本应用
 */
export interface ImageCallbackConfig {
  // 节点
  node: string;
  // 标题节点
  title: string;
  // 标题key
  key: string;
  // 默认值
  value: string;
}

const defaultConfig: ImageCallbackConfig = {
  node: '',
  title: '',
  key: '',
  value: 'image',
};
export const callbacks = {
  default: defaultConfig,
  name: 'image_callback',
};
