import {MatchEditorRegistry} from "./MatchEditor";
import NormalMatchEditor, {
    defaultValue as normalDefaultValue,
    validate as normalValidate
} from "@/app/business/preset/lorebook/match/NormalMatchEditor";

export const lorebookEditorRegistry = new MatchEditorRegistry("preset tabs");

export function initializeLorebook() {
    lorebookEditorRegistry
        .register(
            {
                id: "normal",
                component: NormalMatchEditor,
                defaultValue: normalDefaultValue,
                validate: normalValidate,
            }
        );
}
