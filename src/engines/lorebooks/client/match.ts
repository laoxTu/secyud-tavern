import {engineName, enginePlural, PresetLorebookModel} from "../models";
import {ClientRegistry} from "@/plugins/client";
import {Matcher, MatcherMatchContext} from "./match-models";

export const lorebookMatcherRegistry = new ClientRegistry<Matcher>(engineName + "Matcher");

export async function tryFillActiveLorebooks(lorebooks: Record<string, PresetLorebookModel>,
                                       context: MatcherMatchContext) {
    const message = context.message;
    const matchers = lorebookMatcherRegistry.records;
    const activeLorebooks: string[] = [];
    for (const [key, lorebook] of Object.entries(lorebooks)) {
        const matcher = matchers[lorebook.matchType];
        if (matcher && await matcher.match(context, lorebook)) {
            activeLorebooks.push(key);
        }
    }
    message.properties[enginePlural] = activeLorebooks;
    return activeLorebooks;
}