
export interface LoraConfig {
    on: boolean;
    lora: string;
    strength: number;
}

export interface PowerLoraSelectorConfig {
    nodeId: string;
    defaultValue: LoraConfig[];
}