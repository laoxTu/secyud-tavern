import {matchName, NormalMatchModel} from "../models";
import {MatchEditor} from "./editor";
import {Matcher, MatcherMatchContext} from "@/engines/lorebooks/client/match-models";
import {StoryHistoryMessage} from "@/modules/slots/models";

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

export function normalMatch(message: StoryHistoryMessage, expression?: NormalMatchModel) {
    if (!expression || expression.keywordsLength === 0) return false;
    let fitCount = 0;
    for (const keywords of expression.keywords) {
        if (keywords.some(keyword => message.content.includes(keyword))) {
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
        editor: MatchEditor,
        getEditorValue: (data): NormalMatchModel => {
            return getNormalModel(data);
        },
        match: (ctx: MatcherMatchContext, expression?: NormalMatchModel) => {
            return normalMatch(ctx.message, expression);
        }
    } as const;