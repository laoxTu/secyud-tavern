import {ConversationProvider} from "@/client/business/slots/conversation";
import {PresetStyleModel} from "@/shared/business/presets/styles/models";


export const styleConversationProvider: ConversationProvider = {
    id: "style",
    onProcessInput: async () => {
    },
    onProcessOutput: async () => {
    },
    onRenderPage: async (ctx) => {
        let styles: PresetStyleModel[] = ctx.slot.content.styles;
        if (!styles) {
            styles = [];
            for (const preset of ctx.slot.presets) {
                const entryStyles: PresetStyleModel[] = preset.entries?.styles;
                if (!entryStyles) continue;
                for (const style of entryStyles) {
                    styles.push(style);
                }
            }
            styles.sort( (a,b) => a.priority - b.priority);
            ctx.slot.content.styles = styles;
        }

        for (const style of styles) {
            const styleElement = ctx.document.createElement('style');
            styleElement.innerHTML = style.content;
            ctx.document.head.appendChild(styleElement);
        }
    },
};
