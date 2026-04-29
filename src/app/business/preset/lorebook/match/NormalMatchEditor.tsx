import {MatchEditorProps} from "@/app/business/preset/lorebook/MatchEditor";
import CustomCombobox from "@/components/combobox/CustomCombobox";

export const defaultValue = [];
export const validate = (value: any) =>
    Array.isArray(value) && value.every(item => typeof item === 'string');

export default function NormalMatchEditor({value, onValueChanged}: MatchEditorProps) {
    return (
        <CustomCombobox value={value} onValueChange={onValueChanged}/>
    );
}