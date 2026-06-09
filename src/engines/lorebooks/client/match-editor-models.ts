import {Registerable} from "@/utils/register";

export interface MatchEditorProps {
    defaultValue: any
}

export interface MatchEditor extends Registerable {
    component: React.ComponentType<MatchEditorProps>,
    getValue: (data: FormData) => any,
}