import {MatchEditorRegistry} from "./match";
import {config as normalMatchEditor} from "./match/normal";

export const lorebookMatchEditorRegistry = new MatchEditorRegistry("lorebook tabs");

export function registerLorebook() {
    lorebookMatchEditorRegistry
        .register(
            normalMatchEditor
        );
}
