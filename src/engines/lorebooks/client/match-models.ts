import {Registerable} from "@/utils/register";
import {StoryHistory, StoryHistoryMessage} from "@/stories/models";
import {PresetLorebookModel} from "@/engines/lorebooks/models";

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

export interface Matcher extends Registerable {
    editor: React.ComponentType<MatcherProps>,
    getEditorValue: (data: FormData) => any,
    match: (ctx: MatcherMatchContext, expression: any) => boolean,
}

