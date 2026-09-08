import { NameValue } from '@/database';

interface SelectConfigBase<T = any> {
  node: string;
  key: string;
  value: T;
}

const defaultSelectConfigBase: SelectConfigBase = {
  node: '',
  key: '',
  value: undefined,
};

export interface SelectConfig extends SelectConfigBase {
  items: string[];
}

const defaultSelectConfig: SelectConfig = {
  ...defaultSelectConfigBase,
  items: [],
};

export interface ModelSelectConfig extends SelectConfigBase<
  NameValue | null | undefined
> {
  type?: string | null;
}

const defaultModelSelectConfig: ModelSelectConfig = {
  ...defaultSelectConfigBase,
  type: 'unet',
};

export interface LoraConfig {
  on: boolean;
  lora: NameValue;
  strength: number;
}

export interface PowerLoraSelectConfig {
  value: LoraConfig[];
  node: string;
}

const defaultPowerLoraSelectConfig: PowerLoraSelectConfig = {
  ...defaultSelectConfigBase,
  value: [],
};

export const selects = {
  select: {
    default: defaultSelectConfig,
    name: 'select',
  },
  modelSelect: {
    default: defaultModelSelectConfig,
    name: 'model_select',
  },
  powerLoraSelect: {
    default: defaultPowerLoraSelectConfig,
    name: 'power_lora_select',
  },
};
