import {LlmapiTool} from "@/engines/tools/client/models";
import {getVariableValue, LlmapiToolModel} from "@/modules/slots/models";
import {Editor} from "@/engines/tools/variable/client/editor";
import {getLastHistory} from "@/modules/slots/client/models";
import {generateCurrentVariables} from "@/modules/slots/client/conversation";


export const variableTool: LlmapiTool = {
    id: "variable", component: Editor,
    getValue: () => ({}),
    invoke: async ({path}: { path: string }, ctx) => {
        const history = getLastHistory(ctx.slot);
        const variables = generateCurrentVariables(history, true);
        return getVariableValue(variables, path, false);
    },
    model(value: any): LlmapiToolModel {
        return {
            function: {
                description: "get the specific path value desc of current variable (the variable after this ai output)",
                name: "",
                parameters: {
                    type: "object",
                    properties: {
                        path: {
                            type: "string",
                            description: "the path of the target variable, use '/' ",
                        }
                    },
                    required: ["path"],
                }
            },
            type: "function"
        };
    }
};