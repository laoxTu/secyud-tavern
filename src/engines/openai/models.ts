export interface OpenAIConfigModel {
    parameters: {
        model: string,
        stream: boolean,
        presence_penalty: number, // [-2, 2]
        frequency_penalty: number, // [-2, 2]
        max_tokens: number, // [0, tokens * 0.75]
        temperature: number, // [0,2]
        top_p: number, // [0,1]
    },
    extras: any,
    url: string,
}

export const engineName = "openai";
