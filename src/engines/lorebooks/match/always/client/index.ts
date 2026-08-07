import {AlwaysMatchModel, matchName} from "../models";
import {MatchEditor} from "./editor";
import {Matcher} from "@/engines/lorebooks/client/match-models";


export const alwaysMatcher: Matcher =
    {
        id: matchName,
        component: MatchEditor,
        getValue: (data): AlwaysMatchModel => {
            return {
                lastMessage: !!data.get("lastMessage")
            };
        },
        match: () => {
            return true;
        }
    } as const;