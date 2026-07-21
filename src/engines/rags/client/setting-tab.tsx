import {useTranslations} from "next-intl";
import {Field, FieldContent, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Button} from "@/components/ui/button";
import React, {useState} from "react";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {BookIcon} from "lucide-react";
import {engineName} from "@/engines/rags/models";
import {embeddingGeneratorManager} from "@/engines/rags/client/embedding";
import {RagEmbeddingGeneratorProvider, useRagSettingState} from "@/engines/rags/client/models";
import {useErrorHandler} from "@/handler/client/error";
import {Checkbox} from "@/components/ui/checkbox";
import {Selector} from "@/components/custom/selector";

function Tab() {
    const t = useTranslations();
    const {disabled, embeddingGenerator} = useRagSettingState();
    const {handleError, handleSuccess} = useErrorHandler();
    const [editor, setEditor] = useState<RagEmbeddingGeneratorProvider | null>(
        embeddingGeneratorManager.records[embeddingGenerator] ?? null);

    const handleSubmit = async (data: FormData) => {
        try {
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
                            <Field>
                                <FieldLabel htmlFor="setting-generator">
                                    {t("rag.embedding_generator")}
                                </FieldLabel>
                                <Selector id={`setting-generator`}
                                          items={embeddingGeneratorManager.getSorted()}
                                          name="generator"
                                          value={editor}
                                          onValueChange={setEditor}
                                          labelAccessor={e => e.id}
                                          valueAccessor={e => e.id}/>
                            </Field>
                        </div>
                        {editor?.component && (() => {
                            const Component = editor.component;
                            return <Component/>
                        })()}
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