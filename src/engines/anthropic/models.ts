export interface AnthropicInputBuilderConfigModel {
    type: string,
}

export interface AnthropicConfigModel {
    parameters: {
        model: string,
        max_tokens: number,
        temperature: number, // [0,2]
        top_p: number, // [0,1]
    },
    extras: any,
    url: string,
    inputBuilder: AnthropicInputBuilderConfigModel,
}

export const engineName = "anthropic";
