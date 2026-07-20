interface Task {
    promise: Promise<any>;
    startTime: number;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: any;
    error?: any;
}

const allTasks = (() => {
    const g = globalThis as { __tasks?: Map<string, Task> };
    g.__tasks ??= new Map<string, Task>();
    return g.__tasks;
})();

export const task = {
    get: (id: string): Task | null => {
        return allTasks.get(id) || null;
    },

    create: async (id: string, func: () => Promise<any>): Promise<{
        success: boolean;
        message: string;
        task: Task;
    }> => {
        const tasks = allTasks;
        if (tasks.has(id)) {
            const existing = tasks.get(id)!;
            return {
                success: false,
                message: `task "${id}" is running (status: ${existing.status})`,
                task: existing
            };
        }
        const startTime = Date.now();
        const task: Task = {
            promise: func(),
            startTime,
            status: 'running'
        };

        tasks.set(id, task);
        console.log(`task "${id}" started at ${new Date(startTime)}`);
        // ✅ 使用 Promise 链处理结果
        task.promise
            .then((result) => {
                // ✅ 通过引用更新任务状态
                task.status = 'completed';
                task.result = result;
                const current = new Date();
                console.log(`task "${id}" finished at ${current}, time taken : ${current.getTime() - startTime}ms`);
            })
            .catch((error) => {
                task.status = 'failed';
                task.error = error;
                const current = new Date();
                console.error(`task "${id}" failed at ${current}, time taken : ${current.getTime() - startTime}ms`,
                    error);
            })
            .finally(() => {
                const currentTask = tasks.get(id);
                if (currentTask === task) {
                    tasks.delete(id);
                }
            });
        return {
            success: true,
            message: `task "${id}" started`,
            task
        };
    },
    wait: async (id: string, timeout: number = 30000): Promise<any> => {
        const task = allTasks.get(id);

        if (!task) {
            throw new Error(`task "${id}" not found`);
        }

        if (task.status === 'completed') {
            return task.result;
        }

        if (task.status === 'failed') {
            throw task.error;
        }

        // 等待完成
        return Promise.race([
            task.promise,
            new Promise<any>((_, reject) => {
                setTimeout(() => reject(new Error(`task wait "${id}" out of time`)), timeout);
            })
        ]);
    }
}