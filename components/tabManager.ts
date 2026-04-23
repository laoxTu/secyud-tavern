// Tab 配置类型

export interface TabConfig {
    id: string;
    label: string;
    icon?: React.ReactNode;
    component: React.ComponentType;
    priority?: number; // 排序优先级，数值越小越靠前
}

// Tab 注册表
export class TabManager {
    private tabs: Map<string, TabConfig> = new Map();

    register(config: TabConfig) {
        this.tabs.set(config.id, config);
        return () => this.unregister(config.id);
    }

    unregister(id: string) {
        this.tabs.delete(id);
    }

    getAll(): TabConfig[] {
        return Array.from(this.tabs.values())
            .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
    }

    get(id: string): TabConfig | undefined {
        return this.tabs.get(id);
    }
}