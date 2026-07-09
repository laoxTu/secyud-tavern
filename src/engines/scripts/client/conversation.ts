'use client';
import {
    renderData,
    SlotContentRenderer,
    SlotInitializer,
    SlotStreamRenderer
} from "@/modules/slots/client/conversation-models";
import {PresetScriptModel, engineName, enginePlural} from "../models";
import {engineName as regexEngineName} from "../../regexes/models";
import {generateCurrentVariables} from "@/modules/slots/client/conversation";
import {mergeObjects} from "@/utils";

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
        ctx.slot.content[enginePlural] = cache;
    },
    onRenderStream: async (ctx) => {
        renderData(ctx, "variables", generateCurrentVariables(ctx.history));
    },
    onRenderContent: async (ctx) => {
        const window = (ctx.window as any);
        // 使用window的变量，以防window切换实例
        if (!window.__injectedScriptInitialized) {
            window.__injectedScriptInitialized = true;
            console.debug('start generate injected-scripts');
            const cache: ScriptConversationCache = ctx.slot.content[enginePlural];

            if (cache.importMap !== "{}") {
                const script = ctx.document.createElement("script");
                script.id = `${prefix}-import-map`;
                script.type = "importmap";
                script.innerHTML = cache.importMap;
                ctx.document.head.appendChild(script);
            }

            const set = new Set<string>();
            for (const entry of cache.entries) {
                const id = `${prefix}-${entry.code}`;
                if (set.has(id)) continue;
                set.add(id);
                const script = ctx.document.createElement("script");
                script.id = id;
                // link 类型意味着链接
                if (entry.type === 'link') {
                    script.src = entry.content.trim();
                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = reject;
                        ctx.document.body.appendChild(script);
                    });
                } else {
                    script.type = entry.type ?? "";
                    script.innerHTML = entry.content;
                    ctx.document.body.appendChild(script);
                }
            }
        }
        renderData(ctx, "variables", generateCurrentVariables(ctx.history));
    }
};
