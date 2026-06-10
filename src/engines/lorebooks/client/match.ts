import {engineName} from "../models";
import {ClientRegistry} from "@/plugins/client";
import {Matcher} from "./match-models";
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