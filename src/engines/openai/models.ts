export interface OpenAIInputBuilderConfigModel {
    type: string,
}

export interface OpenAIConfigModel {
    parameters: {
        model: string,
        presence_penalty: number, // [-2, 2]
        frequency_penalty: number, // [-2, 2]
        temperature: number, // [0,2]
        top_p: number, // [0,1]
    },
    extras: any,
    url: string,
    inputBuilder: OpenAIInputBuilderConfigModel,
}

export const engineName = "openai";
