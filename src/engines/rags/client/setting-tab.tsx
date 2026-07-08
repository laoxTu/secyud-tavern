import {useTranslations} from "next-intl";
import {Field, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import React, {useState} from "react";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {BookIcon} from "lucide-react";
import {engineName} from "@/engines/rags/models";
import {embeddingGeneratorManager} from "@/engines/rags/client/embedding";
import {useRagSettingState} from "@/engines/rags/client/models";

function Tab() {
    const t = useTranslations();
    const {embeddingGenerator} = useRagSettingState();
    const generators = embeddingGeneratorManager.records;
    const [editor, setEditor] = useState(generators[embeddingGenerator]);

    const handleSubmit = async (data: FormData) => {
        useRagSettingState.setState({
            embeddingGenerator: editor.id,
            embeddingGeneratorConfig: editor.getEditorValue(data),
        });
    }
    return (
        <form action={handleSubmit} className={"h-full"}>
            <FieldGroup className={"flex flex-col h-full"}>
                <FieldSet className={"flex-1 p-2 overflow-auto"}>
                    <FieldGroup>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="setting-generator">
                                    {t("rag.embedding_generator")}
                                </FieldLabel>
                                <Select name="generator" defaultValue={embeddingGenerator}
                                        onValueChange={v => {
                                            setEditor(generators[v]);
                                        }}>
                                    <SelectTrigger className="w-full"
                                                   id={`setting-generator`}>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            {embeddingGeneratorManager.getSorted().map((v) =>
                                                <SelectItem key={v.id} value={v.id}>
                                                    {v.id}
                                                </SelectItem>
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>
                        {editor && (
                            () => {
                                console.debug(editor.id);
                                const EditorComponent = editor.editor;
                                return <EditorComponent/>;
                            }
                        )()}
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