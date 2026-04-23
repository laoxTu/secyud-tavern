// components/layout/main-layout.tsx
'use client';

import React, {useState, useEffect, createContext, useContext} from 'react';
import {ChevronLeft, ChevronRight, Menu, X} from 'lucide-react';




// Layout 配置 Context
interface LayoutContextValue {
    titleBarVisible: boolean;
    setTitleBarVisible: (visible: boolean) => void;
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    activeTabId: string;
    setActiveTabId: (id: string) => void;
    immersiveMode: boolean;
    toggleImmersiveMode: () => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayout must be used within MainLayout');
    }
    return context;
};

// 插件 Hook：用于在组件中注册 Tab
export function useRegisterTab(config: TabConfig, deps: any[] = []) {
    useEffect(() => {
        const unregister = tabRegistry.register(config);
        return unregister;
    }, deps);
}

// 预设的默认 Tabs
const DEFAULT_TABS: TabConfig[] = [
    {
        id: 'chat',
        label: '存档',
        priority: 10,
        component: () => <div className="p-4">聊天存档列表</div>,
    },
    {
        id: 'preset',
        label: '预设',
        priority: 20,
        component: () => <div className="p-4">预设管理</div>,
    },
    {
        id: 'api',
        label: 'API',
        priority: 30,
        component: () => <div className="p-4">API 配置</div>,
    },
    {
        id: 'settings',
        label: '设定',
        priority: 40,
        component: () => <div className="p-4">系统设定</div>,
    },
];

interface MainLayoutProps {
    children?: React.ReactNode;
    defaultTab?: string;
}

export function MainLayout({children, defaultTab = 'chat'}: MainLayoutProps) {
    const [titleBarVisible, setTitleBarVisible] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTabId, setActiveTabId] = useState(defaultTab);
    const [immersiveMode, setImmersiveMode] = useState(false);
    const [tabs, setTabs] = useState<TabConfig[]>([]);

    // 同步 Tab 注册表
    useEffect(() => {
        const updateTabs = () => {
            const registeredTabs = tabRegistry.getAll();
            // 合并默认 Tabs（如果未被覆盖）
            const allTabs = [...DEFAULT_TABS];
            registeredTabs.forEach(tab => {
                const index = allTabs.findIndex(t => t.id === tab.id);
                if (index >= 0) {
                    allTabs[index] = tab;
                } else {
                    allTabs.push(tab);
                }
            });
            setTabs(allTabs.sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100)));
        };

        updateTabs();
        // 简单起见，这里用定时器轮询，生产环境建议用事件系统
        const interval = setInterval(updateTabs, 100);
        return () => clearInterval(interval);
    }, []);

    const toggleImmersiveMode = () => {
        const newMode = !immersiveMode;
        setImmersiveMode(newMode);
        if (newMode) {
            setTitleBarVisible(false);
            setSidebarCollapsed(true);
        }
    };

    const ActiveComponent = tabs.find(t => t.id === activeTabId)?.component;

    const contextValue: LayoutContextValue = {
        titleBarVisible,
        setTitleBarVisible,
        sidebarCollapsed,
        setSidebarCollapsed,
        activeTabId,
        setActiveTabId,
        immersiveMode,
        toggleImmersiveMode,
    };

    return (
        <LayoutContext.Provider value={contextValue}>
            <div
                className={cn(
                    'h-screen w-screen flex flex-col bg-background',
                    immersiveMode && 'immersive-mode'
                )}
                onMouseMove={() => {
                    if (immersiveMode) {
                        // 沉浸模式下，鼠标移动到顶部边缘显示标题栏
                        // 具体实现在 TitleBar 组件中
                    }
                }}
            >
                {/* 标题栏 */}
                <TitleBar/>

                {/* 主内容区 */}
                <div className="flex-1 flex overflow-hidden">
                    {/* 侧边栏 */}
                    <Sidebar tabs={tabs}/>

                    {/* 内容面板 */}
                    <div className="flex-1 overflow-auto">
                        {ActiveComponent ? <ActiveComponent/> : children}
                    </div>
                </div>
            </div>
        </LayoutContext.Provider>
    );
}

// 标题栏组件
function TitleBar() {
    const {
        titleBarVisible,
        setTitleBarVisible,
        immersiveMode,
        toggleImmersiveMode
    } = useLayout();
    const [isHovered, setIsHovered] = useState(false);
    const [autoHideTimer, setAutoHideTimer] = useState<NodeJS.Timeout | null>(null);

    // 沉浸模式下的自动隐藏逻辑
    useEffect(() => {
        if (!immersiveMode) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (e.clientY < 50) {
                setIsHovered(true);
                if (autoHideTimer) {
                    clearTimeout(autoHideTimer);
                    setAutoHideTimer(null);
                }
            } else if (isHovered) {
                const timer = setTimeout(() => {
                    setIsHovered(false);
                }, 1000);
                setAutoHideTimer(timer);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (autoHideTimer) clearTimeout(autoHideTimer);
        };
    }, [immersiveMode, isHovered, autoHideTimer]);

    const shouldShow = !immersiveMode ? titleBarVisible : (titleBarVisible || isHovered);

    if (!shouldShow) return null;

    return (
        <div
            className={cn(
                'h-12 border-b flex items-center justify-between px-4 transition-all duration-300',
                'bg-card/95 backdrop-blur-sm',
                immersiveMode && 'fixed top-0 left-0 right-0 z-50 shadow-md'
            )}
            onMouseEnter={() => immersiveMode && setIsHovered(true)}
            onMouseLeave={() => {
                if (immersiveMode) {
                    const timer = setTimeout(() => setIsHovered(false), 500);
                    setAutoHideTimer(timer);
                }
            }}
        >
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setTitleBarVisible(false)}
                    className="p-1.5 hover:bg-accent rounded-md transition-colors"
                    title="隐藏标题栏"
                >
                    <ChevronLeft className="w-4 h-4"/>
                </button>
                <h1 className="font-semibold">Secyud Tavern</h1>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={toggleImmersiveMode}
                    className={cn(
                        'px-3 py-1.5 text-sm rounded-md transition-colors',
                        immersiveMode
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                    )}
                    title={immersiveMode ? '退出沉浸模式' : '进入沉浸模式'}
                >
                    {immersiveMode ? '沉浸中' : '沉浸'}
                </button>
            </div>
        </div>
    );
}

// 侧边栏组件
function Sidebar({tabs}: { tabs: TabConfig[] }) {
    const {sidebarCollapsed, setSidebarCollapsed, activeTabId, setActiveTabId} = useLayout();

    return (
        <div
            className={cn(
                'border-r bg-card/50 flex flex-col transition-all duration-300',
                sidebarCollapsed ? 'w-12' : 'w-48'
            )}
        >
            {/* 折叠按钮 */}
            <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-accent rounded-md m-1 transition-colors self-end"
                title={sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'}
            >
                {sidebarCollapsed ? <Menu className="w-4 h-4"/> : <ChevronLeft className="w-4 h-4"/>}
            </button>

            {/* Tab 列表 */}
            <nav className="flex-1 p-1 space-y-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors',
                            'hover:bg-accent',
                            activeTabId === tab.id && 'bg-primary/10 text-primary',
                            sidebarCollapsed && 'justify-center px-2'
                        )}
                        title={sidebarCollapsed ? tab.label : undefined}
                    >
                        {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
                        {!sidebarCollapsed && <span className="text-sm">{tab.label}</span>}
                    </button>
                ))}
            </nav>
        </div>
    );
}

// 隐藏标题栏时显示的浮动按钮
export function TitleBarToggle() {
    const {titleBarVisible, setTitleBarVisible} = useLayout();

    if (titleBarVisible) return null;

    return (
        <button
            onClick={() => setTitleBarVisible(true)}
            className="fixed top-2 right-2 z-50 p-2 bg-card/80 backdrop-blur-sm border rounded-full shadow-lg hover:bg-accent transition-colors"
            title="显示标题栏"
        >
            <ChevronRight className="w-4 h-4"/>
        </button>
    );
}