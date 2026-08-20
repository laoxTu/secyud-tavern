import {VariableConfigModel} from "@/engines/tools/variable/models";
import {Field, FieldContent, FieldLabel} from "@/components/ui/field";
import {Checkbox} from "@/components/ui/checkbox";
import {LlmapiToolProps} from "@/engines/tools/client/models";
import {useTranslations} from "next-intl";
import {mergeObjects} from "@/utils";

const defaultConfig: VariableConfigModel = {
    disableSet: false,
    disableGet: false,
};

export function Editor({entry}: LlmapiToolProps) {
    const t = useTranslations();
    const config: VariableConfigModel = mergeObjects(defaultConfig, entry.value);
    return (<>
        <Field>
            <FieldLabel htmlFor={`${entry.id}-disable_get`}>
                {t('variable.disable_get')}
            </FieldLabel>
            <FieldContent>
                <Checkbox name="disable_get"
                          id={`${entry.id}-disable_get`}
                          defaultChecked={config.disableGet}/>
            </FieldContent>
        </Field>
        <Field>
            <FieldLabel htmlFor={`${entry.id}-disable_set`}>
                {t('variable.disable_set')}
            </FieldLabel>
            <FieldContent>
                <Checkbox name="disable_set"
                          id={`${entry.id}-disable_set`}
                          defaultChecked={config.disableSet}/>
            </FieldContent>
        </Field>
    </>);
}