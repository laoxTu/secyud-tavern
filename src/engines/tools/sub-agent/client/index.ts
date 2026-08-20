import {Editor} from "./editor";
import {SubAgentConfigModel} from "../models";
import {LlmapiTool, LlmapiToolProvider} from "@/engines/tools/client/models";
import {LlmapiToolConfigModel} from "@/engines/tools/models";
import {LlmapiToolModel, SlotModel} from "@/modules/slots/models";
import {conversationManager} from "@/modules/slots/client/conversation";
import {useStoryChatboxState} from "@/modules/slots/client/history-chatbox";
import {historyUtils, messageUtils, SlotHistory} from "@/modules/models";
import {slotContext} from "@/modules/slots/client/context";

export const subAgentToolProvider: LlmapiToolProvider = {
    id: "sub_agent",
    component: Editor,
    getValue: (data: FormData): SubAgentConfigModel => {
        return {
            disableTags: data
                .getAll('disable_tags')
                .map(u => String(u)),
            description: data.get('description') as string,
            prompt: data.get('prompt') as string,
            disablePreset: !!data.get('disable_preset'),
            maxLength: parseInt(data.get('max_length') as string),
        };
    },
    async create(config: LlmapiToolConfigModel, slot) {
        const configValue: SubAgentConfigModel = config.value;
        const disableTags = new Set(configValue.disableTags);
        const subSlot: SlotModel = {
            id: slot.id,
            name: slot.name,
            requires: slot.requires,
            get content() {
                return slot.content;
            },
            get llmapi() {
                return slot.llmapi;
            },
            get histories() {
                return slot.histories;
            },
            presets: configValue.disablePreset ? [] : slot.presets.filter(u => u.tags.every(v => !disableTags.has(v))),
            context: {}
        }
        await conversationManager.initializer.initialize(subSlot);
        return [new SubAgentTool(config.code, configValue, subSlot)];
    },
};

export class SubAgentTool implements LlmapiTool {
    model: LlmapiToolModel;

    constructor(
        name: string,
        private config: SubAgentConfigModel,
        private slot: SlotModel) {
        this.model = {
            name: name,
            description: config.description,
            parameters: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    prompt: {
                        type: 'string',
                        description: `the prompt for sub agent`,
                    },
                },
            },
        }
    }

    async invoke({prompt}: { prompt: string }) {
        let instance: {
            abort: () => void,
        } | null = null;

        const setSignal = async (signal: AbortController | null) => {
            if (instance) {
                instance.abort();
            }
            if (signal) {
                const parent = useStoryChatboxState.getState().signal;
                const abort = () => {
                    signal.abort();
                    parent?.signal.removeEventListener("abort", abort);
                };
                parent?.signal.addEventListener("abort", abort);
                instance = {abort};
            }
        }
        const history: SlotHistory = {
            code: "",
            disabled: false,
            id: 0,
            inputs: [messageUtils.setContent({
                content: "", properties: {}, variables: []
            }, `${this.config.prompt}${prompt}`)],
            name: "",
            outputId: 0,
            outputs: [],
            summary: false,
            variables: historyUtils.getVariables(slotContext.getHistory())
        };
        let result: string = "error: empty content";
        const histories = this.slot.histories;
        const maxLength = this.config.maxLength;
        for await (const {output} of conversationManager.inputProcesser
            .requestReply(history, setSignal, {
                ...this.slot,
                histories: [...(maxLength ? histories.slice(-maxLength) : histories), history]
            })) {
            result = output.content;
        }

        return {
            content: result,
            hidden: false,
        };
    }
}
