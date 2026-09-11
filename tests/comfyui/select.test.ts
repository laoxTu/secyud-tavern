import { describe, expect, it } from 'vitest';

import type { ComfyUIParam, ComfyUIWorkflowInput } from '@/comfyui';
import type { PowerLoraSelectConfig } from '@/comfyui/select';
import { selects } from '@/comfyui/select/client';
import type { NameValue } from '@/database';

/**
 * 表单字段名与 PowerLoraSelectInputComponent 中渲染的 name 保持一致，
 * 若组件改了命名规则，这里也要跟着改。
 */
const SEQUENCE = 3;

const NODE = '10';

function createParam(): ComfyUIParam<PowerLoraSelectConfig> {
  return {
    masterId: 'workflow',
    sequence: SEQUENCE,
    type: 'power_lora_select',
    name: 'LoRA',
    config: { node: NODE, value: [] },
  };
}

function createInput(): ComfyUIWorkflowInput {
  return {
    [NODE]: {
      inputs: {},
      class_type: 'Power Lora Loader (rgthree)',
      _meta: { title: 'Power Lora Loader (rgthree)' },
    },
  };
}

interface LoraFormEntry {
  /** 已选中的 LoRA，未选中则不产生表单字段 */
  lora?: NameValue;
  strength?: string;
  /** 勾选框未选中时浏览器不会写入字段 */
  on?: boolean;
}

/** 按真实的表单结构构造 FormData */
function createFormData(entries: LoraFormEntry[]): FormData {
  const data = new FormData();
  data.append('node', NODE);
  data.append(`count_${SEQUENCE}`, `${entries.length}`);
  entries.forEach((entry, i) => {
    if (entry.lora) {
      data.append(`lora_${SEQUENCE}_${i}`, JSON.stringify(entry.lora));
    }
    if (entry.strength !== undefined) {
      data.append(`lora_strength_${SEQUENCE}_${i}`, entry.strength);
    }
    if (entry.on) {
      data.append(`lora_on_${SEQUENCE}_${i}`, 'on');
    }
  });
  return data;
}

const LORA_A: NameValue = { value: 'id-a', name: 'a.safetensors' };
const LORA_B: NameValue = { value: 'id-b', name: 'b.safetensors' };

const TWO_LORAS: LoraFormEntry[] = [
  { lora: LORA_A, strength: '0.7', on: true },
  { lora: LORA_B, strength: '1.25', on: false },
];

describe('comfyui powerLoraSelect', () => {
  describe('configureObject', () => {
    it('应当为每个 LoRA 读取各自的表单字段', async () => {
      const param = createParam();

      await selects.configurator.powerLoraSelect.configureObject!(
        createFormData(TWO_LORAS),
        param,
      );

      expect(param.config.node).toBe(NODE);
      expect(param.config.value).toHaveLength(2);
      expect(param.config.value[0]).toEqual({
        lora: LORA_A,
        strength: 0.7,
        on: true,
      });
      expect(param.config.value[1]).toEqual({
        lora: LORA_B,
        strength: 1.25,
        on: false,
      });
    });

    it('不同的 LoRA 之间不应当互相串值', async () => {
      const param = createParam();

      await selects.configurator.powerLoraSelect.configureObject!(
        createFormData([
          ...TWO_LORAS,
          { lora: { value: 'id-c', name: 'c.safetensors' }, strength: '2' },
        ]),
        param,
      );

      const [first, second, third] = param.config.value;
      expect(first.lora.name).not.toBe(second.lora.name);
      expect(second.lora.name).not.toBe(third.lora.name);
      expect(first.strength).not.toBe(second.strength);
    });

    it('数量为 0 时应当得到空列表', async () => {
      const param = createParam();

      await selects.configurator.powerLoraSelect.configureObject!(
        createFormData([]),
        param,
      );

      expect(param.config.value).toEqual([]);
    });
  });

  describe('configureInput', () => {
    it('应当把每个 LoRA 写入对应的 lora_i 输入', () => {
      const input = createInput();

      selects.configurator.powerLoraSelect.configureInput!(
        createFormData(TWO_LORAS),
        createParam(),
        input,
      );

      // 写入的是 name（path），不是 value（id）
      expect(input[NODE].inputs.lora_1).toEqual({
        lora: 'a.safetensors',
        strength: 0.7,
        on: true,
      });
      expect(input[NODE].inputs.lora_2).toEqual({
        lora: 'b.safetensors',
        strength: 1.25,
        on: false,
      });
    });

    it('不同序号的 LoRA 不应当写入相同的路径', () => {
      const input = createInput();

      selects.configurator.powerLoraSelect.configureInput!(
        createFormData(TWO_LORAS),
        createParam(),
        input,
      );

      expect(input[NODE].inputs.lora_1.lora).not.toBe(
        input[NODE].inputs.lora_2.lora,
      );
    });

    it('未使用的 lora_i 应当被删除', () => {
      const input = createInput();
      // 模拟上一次数量更多时残留的输入
      for (let i = 1; i <= 10; i++) {
        input[NODE].inputs[`lora_${i}`] = { lora: `stale-${i}` };
      }

      selects.configurator.powerLoraSelect.configureInput!(
        createFormData(TWO_LORAS),
        createParam(),
        input,
      );

      expect(input[NODE].inputs.lora_2).toBeDefined();
      for (let i = 3; i <= 10; i++) {
        expect(input[NODE].inputs[`lora_${i}`]).toBeUndefined();
      }
    });

    it('数量为 0 时应当清空所有 lora_i 输入', () => {
      const input = createInput();
      for (let i = 1; i <= 10; i++) {
        input[NODE].inputs[`lora_${i}`] = { lora: `stale-${i}` };
      }

      selects.configurator.powerLoraSelect.configureInput!(
        createFormData([]),
        createParam(),
        input,
      );

      for (let i = 1; i <= 10; i++) {
        expect(input[NODE].inputs[`lora_${i}`]).toBeUndefined();
      }
    });

    it('节点不存在时应当原样返回', () => {
      const input = createInput();

      expect(() =>
        selects.configurator.powerLoraSelect.configureInput!(
          createFormData(TWO_LORAS),
          createParam(),
          { other: { inputs: {}, class_type: 'x', _meta: { title: 'x' } } },
        ),
      ).not.toThrow();
      expect(input[NODE].inputs).toEqual({});
    });
  });
});
