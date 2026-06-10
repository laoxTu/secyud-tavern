import {AlwaysMatchModel, matchName} from "../models";
import {MatchEditor} from "./editor";
import {Matcher} from "@/engines/lorebooks/client/match-models";


export const alwaysMatcher: Matcher =
    {
        id: matchName,
        editor: MatchEditor,
        getEditorValue: (data): AlwaysMatchModel => {
            return {
                lastMessage: Boolean(data.get("lastMessage") as string)
            };
        },
        match: () => {
            return true;
        }
    } as const;