import {matchName, VariableMatchModel} from "../models";
import {MatchEditor} from "./editor";
import {Matcher, matchUtils} from "@/engines/lorebooks/client/match-models";
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
        match: async (context, lorebook) => {
            const variables = matchUtils.getVariables(context);
            const expression: VariableMatchModel = lorebook.matchExpression;
            const {exists, current} = extract(variables, expression.path);
            return exists && String(current) === expression.value;
        }
    } as const;