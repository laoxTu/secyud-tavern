import {NormalMatchModel} from "@/engines/lorebooks/match/normal/models";

export interface EventDate{
    year: number;
    month: number;
    day: number;
}

export interface EventMatchModel extends NormalMatchModel{
    maxDate: EventDate,
    minDate: EventDate,
}

export const matchName = 'event';