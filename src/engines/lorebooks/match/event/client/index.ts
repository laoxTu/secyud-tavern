import {EventDate, EventMatchModel, matchName} from "../models";
import {MatchEditor} from "./editor";
import {Matcher, MatcherMatchContext} from "@/engines/lorebooks/client/match-models";
import {getNormalModel, normalMatch} from "@/engines/lorebooks/match/normal/client";
import {getDate} from "@/engines/lorebooks/match/event/client/date-editor";

export function getDateNumber(date: EventDate) {
    return date.day + date.month * 31 + date.year * 31 * 12 - 32;
}

export const eventMatcher: Matcher =
    {
        id: matchName,
        editor: MatchEditor,
        getEditorValue: (data): EventMatchModel => {
            return {
                ...getNormalModel(data),
                maxDate: getDate(data, 'max-date'),
                minDate: getDate(data, 'min-date'),
            };
        },
        match: (ctx: MatcherMatchContext, expression?: EventMatchModel) => {
            if (!expression) return false;
            const relatedDates = ctx.variables.relatedDates as EventDate[];
            if (!relatedDates) return false;

            const maxDate = getDateNumber(expression.maxDate);
            const minDate = getDateNumber(expression.minDate);
            if (!relatedDates.some(u => {
                const date = getDateNumber(u);
                return minDate <= date
                    && maxDate >= date
            }))
                return false;
            return normalMatch(ctx.message, expression);
        }
    } as const;