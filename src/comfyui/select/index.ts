import { NameValue } from '@/database';

interface SelectConfigBase {
  node: string;
  key: string;
}

const defaultSelectConfigBase: SelectConfigBase = {
  node: '',
  key: '',
};

export interface SelectConfig extends SelectConfigBase {
  items: string[];
  value?: string | null;
}

const defaultSelectConfig: SelectConfig = {
  ...defaultSelectConfigBase,
  items: [],
};

export interface ModelSelectConfig extends SelectConfigBase {
  type?: string | null;
  fuzzy?: string | null;
  model?: NameValue | null;
}

const defaultModelSelectConfig: ModelSelectConfig = {
  ...defaultSelectConfigBase,
  type: 'diffusion_model',
};

export interface LoraConfig {
  on: boolean;
  lora: NameValue;
  strength: number;
}

export interface PowerLoraSelectConfig {
  loras: LoraConfig[];
  node: string;
}

const defaultPowerLoraSelectConfig: PowerLoraSelectConfig = {
  ...defaultSelectConfigBase,
  loras: [],
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
