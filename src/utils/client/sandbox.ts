// 一个 Worker 实例，处理所有脚本执行请求
export class Sandbox {
    private worker: Worker;
    private requests: Map<string, {
        resolve: (value: any) => void;
        reject: (reason: any) => void;
        timeout: NodeJS.Timeout;
    }>;
    private nextRequestId: number;

    constructor() {
        this.requests = new Map();
        this.nextRequestId = 0;

        // 创建 Worker（只创建一次）
        this.worker = this.createWorker();
        this.setupMessageHandler();
        this.setupErrorHandler();
    }

    private createWorker(): Worker {
        const workerCode = `
            // Worker 内部维护任务队列
            let currentTask: any = null;
            const functionCache = new Map<string, Function>();
            
            self.onmessage = function(e) {
                const { requestId, script, args, name } = e.data;
                
                try {                
                    let fn = functionCache.get(name);
                    if (!fn) {
                        fn = new Function('input', script);
                        functionCache.set(script, fn);
                    }
                    // 执行脚本
                    const result = fn(args);
                    
                    // 序列化结果
                    let output;
                    if (typeof result === 'string') {
                        output = result;
                    } else if (result === undefined) {
                        output = '';
                    } else if (result === null) {
                        output = 'null';
                    } else {
                        output = JSON.stringify(result);
                    }
                    
                    self.postMessage({
                        requestId,
                        success: true,
                        data: output
                    });
                } catch (error) {
                    self.postMessage({
                        requestId,
                        success: false,
                        error: error.message
                    });
                }
            };
        `;

        const blob = new Blob([workerCode], {type: 'application/javascript'});
        const url = URL.createObjectURL(blob);
        const worker = new Worker(url);
        URL.revokeObjectURL(url);

        return worker;
    }

    private setupMessageHandler() {
        this.worker.addEventListener('message', (e) => {
            const {requestId, success, data, error} = e.data;
            const pending = this.requests.get(requestId);

            if (pending) {
                clearTimeout(pending.timeout);
                this.requests.delete(requestId);

                if (success) {
                    pending.resolve(data);
                } else {
                    pending.reject(new Error(error));
                }
            }
        });
    }

    private setupErrorHandler() {
        this.worker.addEventListener('error', (e) => {
            // Worker 内部错误，清理所有待处理请求
            this.requests.forEach((pending, requestId) => {
                clearTimeout(pending.timeout);
                pending.reject(new Error(`Worker error: ${e.message}`));
                this.requests.delete(requestId);
            });
        });
    }

    // 执行脚本的公共方法
    async execute(name: string, script: string, args: any = {}, timeout: number = 4000): Promise<string> {
        const requestId = `req_${++this.nextRequestId}_${Date.now()}`;

        return new Promise((resolve, reject) => {
            // 设置超时
            const timeoutId = setTimeout(() => {
                this.requests.delete(requestId);
                reject(new Error(`Script execution timeout after ${timeout}ms`));
            }, timeout);

            // 保存待处理请求
            this.requests.set(requestId, {
                resolve,
                reject,
                timeout: timeoutId
            });

            // 发送到 Worker
            this.worker.postMessage({
                requestId,
                name,
                script,
                args
            });
        });
    }

    // 清理资源
    destroy() {
        this.requests.forEach((_, requestId) => {
            this.requests.delete(requestId);
        });
        this.worker.terminate();
    }
}