import { settings } from '@/global/server';
import { signals } from '@/signal/server';
import { TaskProvider } from '@/tasks/server/manager';

import { ComfyUIModelSetting, ComfyUIWorkflowInput } from '..';

import { comfyuis } from '.';

const tasks: TaskProvider<ComfyUIWorkflowInput> = {
  id: 'comfyui-generate',
  async execute(arg, controllder) {
    try {
      const state = await settings.repository.getState<ComfyUIModelSetting>(
        comfyuis.model.setting,
      );
      const setting = state?.data?.state ?? comfyuis.setting.default;
      // 转发请求
      const response = await fetch(`${setting.url}/prompt`, {
        method: 'POST',
        body: JSON.stringify({
          client_id: setting.client,
          prompt: arg.value,
        }),
        signal: controllder.signal,
      });
      const result = await response.text();
      signals.toast({
        type: 'success',
        message: `message.comfyui.generate.success`,
        data: {
          result,
        },
      });
      return result;
    } catch (error) {
      console.error(`[comfyui](generate): `, error);
      signals.toast({
        type: 'error',
        message: `error.comfyui.generate_failed`,
        data: {
          message: (error as any)?.message ?? 'unknown error',
        },
      });
      throw error;
    }
  },
};

export const generator = {
  tasks,
};
