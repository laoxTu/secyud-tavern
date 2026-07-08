import {matchName} from "../models";
import {MatchEditor} from "./editor";
import {Matcher} from "@/engines/lorebooks/client/match-models";


export const vectorMatcher: Matcher =
    {
        id: matchName,
        editor: MatchEditor,
        getEditorValue: () => {
            return {};
        },
        match: () => {
            // 向量匹配走另一条匹配路径，不用这个。
            return false;
        }
    } as const;