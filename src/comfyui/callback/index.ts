/**
 * 回调，用于ComfyUI保存到本应用
 */
export interface CallbackConfig {
  // 节点
  node: string;
}

const defaultConfig: CallbackConfig = { node: '' };
export const callbacks = {
  default: defaultConfig,
  name: 'callback',
};
