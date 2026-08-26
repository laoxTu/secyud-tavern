import {matchName, NormalMatchModel} from "../models";
import {MatchEditor} from "./editor";
import {Matcher, MatcherMatchContext, matchUtils} from "@/engines/lorebooks/client/match-models";

export function getNormalModel(data: FormData): NormalMatchModel {
    const keywordsLength = parseInt(data.get('keywordsLength') as string);
    const keywords: string[][] = [];
    for (let i = 0; i < keywordsLength; i++) {
        keywords.push(data.getAll(`keywords-${i}`) as string[])
    }

    return {
        keywords, keywordsLength,
        fitCount: Math.min(parseInt(data.get('fitCount') as string), keywords.length),
    };
}

export function normalMatch(
    context: MatcherMatchContext,
    expression?: NormalMatchModel) {
    if (!expression?.keywordsLength) return false;
    const content = matchUtils.getContent(context);
    let fitCount = 0;
    for (const keywords of expression.keywords) {
        if (keywords.some(keyword => content.includes(keyword))) {
            fitCount++;
        }
        if (fitCount >= expression.fitCount)
            return true;
    }
    return false;
}

export const normalMatcher: Matcher =
    {
        id: matchName,
        component: MatchEditor,
        getValue: (data): NormalMatchModel => {
            return getNormalModel(data);
        },
        match: async (ctx: MatcherMatchContext, lorebook) => {
            return normalMatch(ctx, lorebook.matchExpression);
        }
    } as const;