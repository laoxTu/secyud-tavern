export interface TaskSseMessage {
    id: string,
    success: boolean,
    error?: any,
}

export const taskSseMessageId = "task-status";