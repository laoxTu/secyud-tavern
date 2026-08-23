import {Editor} from "./editor";
import {SubAgentConfigModel} from "../models";
import {LlmapiTool, LlmapiToolProvider} from "@/engines/tools/client/models";
import {LlmapiToolConfigModel} from "@/engines/tools/models";
import {LlmapiToolModel, SlotModel, StoryModel} from "@/modules/stories/models";
import {conversationManager} from "@/modules/stories/client/conversation";
import {useStoryChatboxState} from "@/modules/stories/client/history-chatbox";
import {checkJson, tryParseJson} from "@/utils";
import {getPresetRequires} from "@/modules/presets/client/tabs";
import {get} from "@/client";
import {BusinessError} from "@/handler/models";

export const subAgentToolProvider: LlmapiToolProvider = {
    id: "sub_agent",
    component: Editor,
    getValue: (data: FormData): SubAgentConfigModel => {
        const schema = data.get('schema') as string;
        if (!checkJson(schema))
            throw new BusinessError("json invalid", "default.json_invalid")
                .withValue("target", "default.schema");
        return {
            schema,
            disableTags: data
                .getAll('disable_tags')
                .map(u => String(u)),
            presets: getPresetRequires(data),
            description: data.get('description') as string,
            disablePreset: !!data.get('disable_preset'),
            maxLength: parseInt(data.get('max_length') as string),
            llmapi: tryParseJson(data.get('llmapi') as string),
        };
    },
    async create(config: LlmapiToolConfigModel, slot) {
        // 子Agent禁止Agent调用
        if (slot.properties.sub_agent) return [];
        const configValue: SubAgentConfigModel = config.value;
        const disableTags = new Set(configValue.disableTags);
        const story: StoryModel = {
            id: "sub_agent",
            name: "sub_agent",
            requires: [
                ...(configValue.presets ?? []),
                ...(configValue.disablePreset ? [] : slot.requires),
            ],
            llmapi: configValue.llmapi ?? slot.llmapi,
            content: {},
        };
        const result: SlotModel = await get("/stories/slot", {
            params: story
        })
        const subSlot: SlotModel = {
            ...result,
            get histories() {
                return slot.histories;
            },
            presets: result.presets.filter(u => u.tags
                .every(v => !disableTags.has(v))),
            properties: {
                sub_agent: 1
            }
        }
        await conversationManager.initializer.initialize({slot: subSlot});
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
            parameters: tryParseJson(config.schema),
        }
    }

    async invoke(args: any) {
        const signal = async (signal: AbortController | null) => {
            if (signal) {
                useStoryChatboxState.getState()
                    .setAbort(() => {
                        console.debug("[sub-agent]: abort");
                        signal.abort("user cancelled");
                    });
            }
        }
        let result: string = "error: empty content";
        // 深拷贝待解析副本，防止不必要的变化，例如工具冲突。
        // 主agent可能已经设置了工具调用
        const histories = structuredClone(this.slot.histories.slice(-this.config.maxLength));
        if (!histories.length) {
            histories.push({
                code: "",
                disabled: false,
                id: 0,
                inputs: [],
                name: "",
                outputId: 0,
                outputs: [],
                summary: false,
                variables: {}
            })
        }
        const history = histories.at(-1)!;
        history.outputs = [];
        history.outputId = -1;
        for await (const {output} of conversationManager.inputProcesser
            .requestReply({
                history, signal,
                slot: {
                    ...this.slot, histories,
                },
                args
            })) {
            result = output.content;
        }

        return {
            content: result,
            hidden: false,
        };
    }
}
