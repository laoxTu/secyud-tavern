import {useTranslations} from "next-intl";
import {Field, FieldContent, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Button} from "@/components/ui/button";
import React from "react";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {BookIcon} from "lucide-react";
import {engineName} from "@/engines/rags/models";
import {embeddingGeneratorManager} from "@/engines/rags/client/embedding";
import {useRagSettingState} from "@/engines/rags/client/models";
import {useErrorHandler} from "@/handler/client/error";
import {Checkbox} from "@/components/ui/checkbox";
import {EditorSelectorField} from "@/components/custom/editor-selector";

function Tab() {
    const t = useTranslations();
    const {disabled, embeddingGenerator} = useRagSettingState();
    const {handleError, handleSuccess} = useErrorHandler();

    const handleSubmit = async (data: FormData) => {
        try {
            const editorName = data.get('generator') as string;
            const editor = embeddingGeneratorManager.records[editorName];
            useRagSettingState.setState({
                disabled: Boolean(data.get("disabled") as string),
                embeddingGenerator: editor?.id ?? "",
                embeddingGeneratorConfig: editor?.getValue(data) ?? {},
            });
            handleSuccess(t("default.saved_successfully"));
        } catch (e) {
            handleError(e);
        }
    }
    return (
        <form action={handleSubmit} className={"h-full"}>
            <FieldGroup className={"flex flex-col h-full"}>
                <FieldSet className={"flex-1 p-2 overflow-auto"}>
                    <FieldGroup>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="setting-rag-disabled">
                                    {t("default.disable")}
                                </FieldLabel>
                                <FieldContent>
                                    <Checkbox id={"setting-rag-disabled"}
                                              name="disabled"
                                              defaultChecked={disabled}/>
                                </FieldContent>
                            </Field>
                        </div>
                        <EditorSelectorField id={`setting-generator`}
                                             name="generator"
                                             defaultValue={embeddingGenerator}
                                             fieldLabel={t("rag.embedding_generator")}
                                             registry={embeddingGeneratorManager}
                                             nameAccessor={e => e.id}
                                             valueAccessor={e => e.id}/>
                    </FieldGroup>
                </FieldSet>
                <Field orientation="horizontal">
                    <Button type="submit">{t("default.save")}</Button>
                </Field>
            </FieldGroup>
        </form>);
}

export const settingTab = {
    id: engineName,
    label: () => <EntryTabHeader space="setting" value={engineName} icon={BookIcon}/>,
    component: Tab
};