export interface SlotCallingResult {
    // 调用结果内容
    content: string,
    // 是否隐藏调用
    hidden?: boolean,
}

export interface SlotCalling {
    // 调用索引
    index: number,
    // 调用id
    id: string,
    // 调用工具名
    name: string,
    // 调用参数
    arguments: string,
    result?: SlotCallingResult
}