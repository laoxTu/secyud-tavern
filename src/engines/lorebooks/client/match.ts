import {engineName, PresetLorebookModel} from "../models";
import {ClientRegistry} from "@/plugins/client";
import {Matcher, MatcherMatchContext} from "./match-models";
import {alwaysMatcher} from "@/engines/lorebooks/match/always/client";
import {normalMatcher} from "@/engines/lorebooks/match/normal/client";
import {eventMatcher} from "@/engines/lorebooks/match/event/client";

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

export const lorebookMatcherRegistry = new MatcherRegistry(engineName, [alwaysMatcher, normalMatcher, eventMatcher]);

export function tryFillActiveLorebooks(lorebooks: Record<string, PresetLorebookModel>,
                                       context: MatcherMatchContext) {
    const message = context.message;
    const matchers = lorebookMatcherRegistry.records;
    message.activeLorebooks = [];

    for (const [key, lorebook] of Object.entries(lorebooks)) {
        const matcher = matchers[lorebook.matchType];
        if (matcher && matcher.match(context, lorebook.matchExpression)) {
            message.activeLorebooks.push(key);
        }
    }
}