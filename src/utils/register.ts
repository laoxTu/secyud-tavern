export interface Registerable {
    id: string;
    sequence?: number;
    requires?: string[];
}

export class Registry<T extends Registerable> {
    records: Record<string, T> = {};
    private sorted: T[] | null = null;
    protected readonly name: string;

    protected constructor(name: string) {
        this.name = name;
    }

    register(...registerableList: T[]): void {
        for (const registerable of registerableList) {
            this.records[registerable.id] = registerable;
            this.invalidateCache();
            console.debug(`[${this.name}] registered: ${registerable.id}`);
        }
    }

    unregister(id: string): boolean {
        const existed = !!this.records[id];
        delete this.records[id];
        this.invalidateCache();
        if (existed) {
            console.debug(`[${this.name}] unregistered: ${id}`);
        }
        return existed;
    }

    async use(action: (t: T) => Promise<void>, endFlag?: () => boolean) {
        const items = this.getSorted();
        console.debug(`[${this.name}] find ${items.length} registrable...`);

        for (const item of items) {
            if (endFlag && endFlag()) {
                break;
            }
            await action(item);
        }
    }

    /**
     * 获取排序后的（带缓存）
     */
    getSorted(): T[] {
        if (this.sorted === null) {
            this.sorted = this.sortByRequires();
        }
        return this.sorted;
    }

    /**
     * 清空缓存
     */
    protected invalidateCache(): void {
        this.sorted = null;
    }

    /**
     * 获取所有已注册的 registerable IDs
     */
    getIds(): string[] {
        return Object.keys(this.records);
    }

    /**
     * 检查 registerable 是否已注册
     */
    has(id: string): boolean {
        return id in this.records;
    }

    /**
     * 基于依赖关系对注册组件进行拓扑排序 (Kahn 算法)
     * @returns 排序后的组件数组
     * @throws {Error} 如果检测到循环依赖
     */
    protected sortByRequires(): T[] {
        const records = this.records;
        const recordList = Object.values(records)
            .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
        console.debug(`[${this.name}] sort ${recordList.length} items`);
        const sorted: T[] = [];
        const visited = new Set<string>();

        // 1. 构建邻接表，并计算每个节点的入度（即有多少个前置依赖）
        const inDegree: Record<string, number> = {};
        const adjacencyList: Record<string, string[]> = {};

        // 初始化所有节点
        for (const id in records) {
            inDegree[id] = 0;
            adjacencyList[id] = [];
        }

        // 填充依赖关系
        for (const record of recordList) {
            const id = record.id;
            const deps = records[id].requires;
            if (!deps) continue;
            for (const dep of deps) {
                // 防止引用了不存在的组件
                if (!records[dep]) {
                    throw new Error(`[Sort Error] Component "${id}" depends on non-existent component "${dep}".`);
                }
                adjacencyList[dep].push(id); // dep 指向 id (dep 完成后才能执行 id)
                inDegree[id]++;             // id 的入度增加
            }
        }

        // 2. 找出所有入度为 0 的节点作为起始队列
        const queue: string[] = [];
        for (const id in records) {
            if (inDegree[id] === 0) {
                queue.push(id);
            }
        }

        // 3. 广度优先遍历处理队列
        while (queue.length > 0) {
            const currentId = queue.shift()!;

            // 防止重复添加（某些实现中可能存在冗余边，这是一种防御性保护）
            if (visited.has(currentId)) continue;
            visited.add(currentId);

            sorted.push(records[currentId]);

            // 遍历当前节点的所有后继节点（即依赖于 currentId 的组件）
            for (const neighbor of adjacencyList[currentId]) {
                inDegree[neighbor]--;

                // 当后继节点的前置依赖全部满足时，入队
                if (inDegree[neighbor] === 0) {
                    queue.push(neighbor);
                }
            }
        }

        // 4. 循环依赖检测：如果排序结果数量不等于总节点数，说明存在环
        if (sorted.length !== recordList.length) {
            const remaining = recordList.filter(t => !visited.has(t.id));
            throw new Error(`[Sort Error] Circular dependency detected involving: ${remaining.join(', ')}`);
        }

        return sorted;
    }
}
