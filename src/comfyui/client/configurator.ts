'use client';
import React, { RefObject } from 'react';

import { ComfyUIParam, ComfyUIWorkflowInput } from '@/comfyui';
import { getRegistry, Registerable } from '@/plugins';

export interface ComfyUIParamProps<TConfig = any> {
  param: ComfyUIParam<TConfig>;
  formRef: RefObject<HTMLFormElement | null>;
}

export interface ParamConfigurator<TConfig = any> extends Registerable {
  /**
   * 设置param参数config
   */
  configureObject?: (
    data: FormData,
    param: ComfyUIParam<TConfig>,
  ) => Promise<void>;
  configComponent?: React.ComponentType<ComfyUIParamProps<TConfig>>;
  /**
   * 通过配置和input中的选项对prompt/workflow输入进行更改
   */
  configureInput?: (
    data: FormData,
    param: ComfyUIParam<TConfig>,
    input: ComfyUIWorkflowInput,
  ) => void;
  /**
   * input组件，comfyui在生图框中可以在此输入，
   * 以此改变模型，提示词等，llm生成提示词也可
   * 放在这里
   */
  inputComponent?: React.ComponentType<ComfyUIParamProps<TConfig>>;
}

const registry = getRegistry<ParamConfigurator>('comfyui-param-configurator');

export const configurators = {
  registry,
};
