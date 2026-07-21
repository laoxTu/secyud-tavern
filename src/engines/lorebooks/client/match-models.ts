import {StoryHistory} from "@/modules/stories/models";
import {PresetLorebookModel} from "@/engines/lorebooks/models";
import {StoryHistoryMessage} from "@/modules/slots/models";
import {EditorRegisterable} from "@/business/client/models";

export interface MatcherProps {
    defaultValue: any,
    entry: PresetLorebookModel
}

export interface MatcherMatchContext {
    history: StoryHistory;
    message: StoryHistoryMessage;
    expression?: any;
    variables: any;
}

export interface Matcher extends EditorRegisterable {
    getValue: (data: FormData) => any,
    match: (ctx: MatcherMatchContext, expression: any) => boolean,
}

