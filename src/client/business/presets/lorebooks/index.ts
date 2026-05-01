import {MatchEditorRegistry} from "./match";
import {config as normalMatchEditor} from "./match/normal";
import {config as eventMatchEditor} from "./match/event";

export const lorebookMatchEditorRegistry = new MatchEditorRegistry("lorebook tabs");

export function registerLorebook() {
    lorebookMatchEditorRegistry
        .register(
            normalMatchEditor,
            eventMatchEditor
        );
}
