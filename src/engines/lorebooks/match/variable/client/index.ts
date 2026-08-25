import {matchName, VariableMatchModel} from "../models";
import {MatchEditor} from "./editor";
import {Matcher} from "@/engines/lorebooks/client/match-models";
import {SlotMessageOutput} from "@/modules/models/message";
import {historyUtils} from "@/modules/models";
import {extract} from "@/utils/json-patch";


export const variableMatcher: Matcher =
    {
        id: matchName,
        component: MatchEditor,
        getValue: (data): VariableMatchModel => {
            return {
                path: data.get("match_path") as string,
                value: data.get("match_value") as string,
            };
        },
        match: (context) => {
            let variables = context.properties.matchVariables;
            if (!variables) {
                const message = context.message as SlotMessageOutput;
                variables = historyUtils.getVariables(context.history, message.thought !== undefined)
                context.properties.matchVariables = variables;
            }
            const expression = context.expression as VariableMatchModel;
            const {exists, current} = extract(variables, expression.path);
            return exists && String(current) === expression.value;
        }
    } as const;