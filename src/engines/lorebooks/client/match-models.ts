import {Registerable} from "@/utils/register";
import {StoryHistory, StoryHistoryMessage} from "@/stories/models";

export interface MatcherProps {
    defaultValue: any
}

export interface MatcherMatchContext {
    history: StoryHistory;
    message: StoryHistoryMessage;
    expression?: any;
    variables: any;
}

export interface Matcher extends Registerable {
    editor: React.ComponentType<MatcherProps>,
    getEditorValue: (data: FormData) => any,
    match: (ctx: MatcherMatchContext, expression: any) => boolean,
}

