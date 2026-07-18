import {Registerable} from "@/utils/register";
import {StoryHistory} from "@/modules/stories/models";
import {PresetLorebookModel} from "@/engines/lorebooks/models";
import {ComponentType} from "react";
import {StoryHistoryMessage} from "@/modules/slots/models";

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
    editor: ComponentType<MatcherProps>,
    getEditorValue: (data: FormData) => any,
    match: (ctx: MatcherMatchContext, expression: any) => boolean,
}

