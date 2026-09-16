export interface AutoPaintParam {
  id: number;
  disabled: boolean;
  description?: string;
  code: string;
}
/**
 * 自动绘图
 */
export interface AutoPaintConfig {
  // 用作方法名
  code: string;
  // 描述
  description?: string;
  // 使用的工作流
  workflow: string;
  // 参数设置
  params: AutoPaintParam[];
}

const defaultConfig: AutoPaintConfig = {
  code: '',
  description: '',
  workflow: '',
  params: [],
};

export const paint = {
  default: defaultConfig,
};
