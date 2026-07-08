import {enginePlural, engineName, PresetLorebookModel} from "../models";
import {ClientRegistry} from "@/plugins/client";
import {Matcher, MatcherMatchContext} from "./match-models";
import {alwaysMatcher} from "@/engines/lorebooks/match/always/client";
import {normalMatcher} from "@/engines/lorebooks/match/normal/client";
import {eventMatcher} from "@/engines/lorebooks/match/event/client";
import {vectorMatcher} from "@/engines/lorebooks/match/vector/client";

export class MatcherRegistry extends ClientRegistry<Matcher> {
    constructor(name: string, matchers?: Matcher[],) {
        super(name + "Matcher");
        if (matchers) {
            for (const matcher of matchers) {
                this.register(matcher);
            }
        }
    }
}

export const lorebookMatcherRegistry = new MatcherRegistry(engineName, [alwaysMatcher, normalMatcher, eventMatcher, vectorMatcher]);

export function tryFillActiveLorebooks(lorebooks: Record<string, PresetLorebookModel>,
                                       context: MatcherMatchContext) {
    const message = context.message;
    const matchers = lorebookMatcherRegistry.records;
    const activeLorebooks: string[] = [];

    for (const [key, lorebook] of Object.entries(lorebooks)) {
        const matcher = matchers[lorebook.matchType];
        if (matcher && matcher.match(context, lorebook.matchExpression)) {
            activeLorebooks.push(key);
        }
    }
    message.properties[enginePlural] = activeLorebooks;
    return activeLorebooks;
}