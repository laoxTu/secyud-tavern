export interface SubAgentConfigModel {
    // 禁用tags，子agent必须依附于主agent，
    // 只可以禁用其中一些预设
    // 子agent只考虑上下文构筑
    disableTags: string[],
    description: string,
    prompt: string,
    maxLength: number,
    disablePreset: boolean,
}