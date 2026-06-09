export interface DeepseekConfigModel {
    parameters: DeepseekConfigParameter
}

export interface DeepseekConfigParameter {
    model: string,
    thinking: {
        "type": string,
    },
    reasoning_effort: string,
    stream: boolean,
}

export const engineName = "deepseek";
