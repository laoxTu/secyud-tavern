import {matchName, NormalMatchModel} from "../models";
import {MatchEditor} from "./editor";
import {Matcher, MatcherMatchContext} from "@/engines/lorebooks/client/match-models";
import {SlotMessageOutput} from "@/modules/models/message";
import {joinAsString} from "@/utils";

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
    let content = context.properties.matchContent;
    if (!content && content !== "") {
        const message = context.message as SlotMessageOutput;
        content = `${message.content ?? ""}${joinAsString(
            message.callings?.filter(
                u => u.result?.hidden === false), "",
            u => u.result?.content ?? "")}`;
        context.properties.matchContent = content;
    }

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
        match: (ctx: MatcherMatchContext, expression?: NormalMatchModel) => {
            return normalMatch(ctx, expression);
        }
    } as const;