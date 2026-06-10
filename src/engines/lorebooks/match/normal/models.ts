export interface NormalMatchModel {
    // 关键词
    keywords: string[][],
    // 关键词组数量
    keywordsLength: number,
    // 需要符合的最小数量
    fitCount: number,
}

export const matchName = 'normal';