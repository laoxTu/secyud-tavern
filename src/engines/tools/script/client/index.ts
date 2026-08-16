import {Editor} from "./editor";
import {ScriptToolConfigModel} from "../models";
import {LlmapiTool, LlmapiToolProvider} from "@/engines/tools/client/models";
import {LlmapiToolConfigModel} from "@/engines/tools/models";
import {LlmapiToolModel} from "@/modules/slots/models";
import {BusinessError} from "@/handler/models";

export const scriptToolProvider: LlmapiToolProvider = {
    id: "script",
    component: Editor,
    getValue: (data: FormData): ScriptToolConfigModel => {
        const schema = data.get('schema') as string;
        try {
            JSON.parse(schema);
        } catch (e: any) {
            throw new BusinessError(e?.message ?? "", "default.json_invalid")
                .withValue("target", "default.schema")
        }
        return {
            script: data.get('script') as string,
            schema,
            description: data.get('description') as string,
        };
    },
    async create(config: LlmapiToolConfigModel) {
        return [new ScriptTool(config.code, config.value)];
    },
};

export class ScriptTool implements LlmapiTool {
    constructor(name: string,
                config: ScriptToolConfigModel) {
        this.model = {
            name,
            description: config.description,
            parameters: JSON.parse(config.schema || "{}"),
        };
        this.fn = new Function("input", config.script)
    }

    fn: Function;

    async invoke(args: any) {
        const result = this.fn(args);
        return typeof result === "string" ? result : JSON.stringify(result);
    }

    model: LlmapiToolModel;
}