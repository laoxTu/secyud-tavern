export interface DeepseekConfigModel {
    parameters: {
        model: string,
        extra_body: {
            thinking: {
                type: 'enabled' | 'disabled',
            },
        },
        // 思考强度控制
        reasoning_effort: string, // high/max
        stream: boolean,
        temperature: number,// [0,2]
        top_p: number,// [0,1]
        logprobs: boolean,
        top_logprobs: number, // [0,20]
    }
}

export const engineName = "deepseek";
