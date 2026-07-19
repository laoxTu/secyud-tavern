/**
 * Project Info 插件
 * 构建: npm run build-plugin project-info
 */
import {businessNavigationManager} from '@/business/client/navigation';
import React from 'react';
import {ModelTabHeader} from "@/business/client/template/tab-header";
import {useTranslations} from "next-intl";

const tags = ["tag1", "tag2", "tag3", "tag4", "tag5"];

function Content() {
    const t = useTranslations();
    return (
        <div className="flex flex-col h-full items-center justify-center min-h-[60vh] gap-8 p-8">
            {/* 图标 */}
            <div
                className="size-16 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <img className="size-12 " style={{
                    filter: 'brightness(0) saturate(100%) invert(100%)'  // 变成白色
                }}
                     src={'favicon.svg'} alt={'secyud tavern'}></img>
            </div>

            {/* 标题 */}
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Secyud Tavern</h1>
                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                    {t('about.description')}
                </p>
            </div>

            {/* 特性标签 */}
            <div className="flex flex-wrap justify-center gap-2">
                {tags.map(tag => (
                    <span
                        key={tag}
                        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:border-foreground/30 transition-colors"
                    >
                        {t(`about.${tag}`)}
                    </span>
                ))}
            </div>

            {/* 链接 */}
            <a
                href="https://github.com/laoxTu/secyud-tavern"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
            >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
            </a>
        </div>
    );
}

export default function register() {
    console.info("[project-info] secyud-tavern: https://github.com/laoxTu/secyud-tavern");

    businessNavigationManager.register({
        id: "info",
        sequence: 10000,
        label: () => <ModelTabHeader modelType={'about'}/>,
        component: Content,
    });
}
