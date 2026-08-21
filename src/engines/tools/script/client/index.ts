import {Editor} from "./editor";
import {ScriptToolConfigModel} from "../models";
import {LlmapiTool, LlmapiToolProvider} from "@/engines/tools/client/models";
import {LlmapiToolConfigModel} from "@/engines/tools/models";
import {LlmapiToolModel, SlotModel} from "@/modules/slots/models";
import {BusinessError} from "@/handler/models";
import {slotContext} from "@/modules/slots/client/context";
import {checkJson} from "@/utils";

export const scriptToolProvider: LlmapiToolProvider = {
    id: "script",
    component: Editor,
    getValue: (data: FormData): ScriptToolConfigModel => {
        const schema = data.get('schema') as string;
        if (!checkJson(schema))
            throw new BusinessError("json invalid", "default.json_invalid")
                .withValue("target", "default.schema")
        return {
            hidden: !!data.get('hidden'),
            enableDoc: !!data.get('enable_doc'),
            enableVariable: !!data.get('enable_variable'),
            script: data.get('script') as string,
            schema,
            description: data.get('description') as string,
        };
    },
    async create(config: LlmapiToolConfigModel, slot) {
        return [new ScriptTool(config.code, config.value, slot)];
    },
};

export class ScriptTool implements LlmapiTool {
    fn: Function;
    hidden: boolean;
    model: LlmapiToolModel;

    constructor(name: string,
                private config: ScriptToolConfigModel,
                private slot: SlotModel) {
        this.model = {
            name,
            description: config.description,
            parameters: JSON.parse(config.schema || "{}"),
        };
        this.fn = new Function("input", "context", config.script);
        this.hidden = config.hidden;
    }

    async invoke(args: any) {
        const context: any = {};
        if (this.config.enableDoc) {
            context.document = slotContext.iframeData.document;
            context.window = slotContext.iframeData.window;
        }
        if (this.config.enableVariable) {
            const history = slotContext.getHistory(undefined, this.slot);
            context.variables = history.variables;
        }
        const result = this.fn(args, context);
        return {
            content: typeof result === "string" ? result : JSON.stringify(result),
            hidden: this.hidden,
        };
    }
}