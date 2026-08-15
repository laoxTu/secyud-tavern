import {VariableConfigModel} from "@/engines/tools/variable/models";
import {Field, FieldLabel} from "@/components/ui/field";
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
    return <>
        <div className="grid md:grid-cols-2 gap-4">
            <Field orientation={"horizontal"}>
                <FieldLabel htmlFor={`${entry.id}-disable_get`}>
                    {t('variable.disable_get')}
                </FieldLabel>
                <Checkbox id={`${entry.id}-disable_get`}
                          name="disable_get"
                          defaultChecked={config.disableGet}/>
            </Field>
            <Field orientation={"horizontal"}>
                <FieldLabel htmlFor={`${entry.id}-disable_set`}>
                    {t('variable.disable_set')}
                </FieldLabel>
                <Checkbox id={`${entry.id}-disable_set`}
                          name="disable_set"
                          defaultChecked={config.disableSet}/>
            </Field>

        </div>
    </>;
}