'use client';
import {
    SlotContentRenderer,
    SlotInitializer,
    SlotStreamRenderer,
    slotUtils
} from "@/modules/stories/client/conversation-models";
import {engineName, enginePlural, PresetScriptModel} from "../models";
import {engineName as regexEngineName} from "../../regexes/models";
import {mergeObjects} from "@/utils";
import {slotContext} from "@/modules/stories/client/context";

const prefix = "injected-script";


export interface ScriptConversationCache {
    importMap: any;
    entries: PresetScriptModel[];
}

export const scriptConversationProvider:
    SlotInitializer
    & SlotContentRenderer
    & SlotStreamRenderer
    = {
    id: engineName,
    requires: [regexEngineName],
    onInitialize: async (ctx) => {
        // importmap 只能写一次，所以合并
        const cache: ScriptConversationCache = {
            importMap: {},
            entries: []
        }
        for (const preset of ctx.slot.presets) {
            const scripts: PresetScriptModel[] = preset.entries?.[enginePlural];
            if (!scripts) continue;
            for (const script of scripts) {
                if (script.disabled) continue;
                if (script.type === 'importmap') {
                    try {
                        const map = JSON.parse(script.content);
                        cache.importMap = mergeObjects(cache.importMap, map);
                    } catch (err) {
                        console.error(
                            `import map error for script ${preset.code}.${script.code}`, err);
                    }
                } else {
                    cache.entries.push(script);
                }
            }
        }
        cache.entries.sort((a, b) => a.priority - b.priority);
        cache.importMap = JSON.stringify(cache.importMap);
        slotUtils.setProperty(ctx.slot, enginePlural, cache);
    },
    onRenderStream: async () => {
    },
    onRenderContent: async (ctx) => {
        const {window, document} = slotContext.iframeData;
        // 使用window的变量，以防window切换实例
        if (!window.__injectedScriptInitialized && document) {
            window.__injectedScriptInitialized = true;
            console.debug('[script]: start inject');
            const cache: ScriptConversationCache = slotUtils.getProperty(ctx.slot, enginePlural);

            if (cache.importMap !== "{}") {
                const script = document.createElement("script");
                script.id = `${prefix}-import-map`;
                script.type = "importmap";
                script.innerHTML = cache.importMap;
                document.head.appendChild(script);
            }

            const set = new Set<string>();
            for (const entry of cache.entries) {
                const id = `${prefix}-${entry.code}`;
                if (set.has(id)) continue;
                set.add(id);
                const script = document.createElement("script");
                script.id = id;
                // link 类型意味着链接：await onload 保证按优先级顺序依次加载；
                // 内联脚本则同步执行
                if (entry.type === 'link') {
                    script.async = true;
                    script.src = entry.content.trim();
                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = reject;
                        document.body.appendChild(script);
                    });
                } else {
                    script.async = false;
                    script.type = entry.type ?? "";
                    script.textContent = entry.content;
                    document.body.appendChild(script);
                }
            }
        }
    }
};
