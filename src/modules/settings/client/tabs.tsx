'use client';
import React from "react";
import {useTranslations} from "next-intl";
import {Settings2Icon} from "lucide-react";
import {TabManager} from "@/components/custom/tab";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {Field, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Button} from "@/components/ui/button";
import {useTheme} from "next-themes";
import {useDefaultSettingState, useRemoteSettingState} from "@/modules/settings/client/models";
import {Input} from "@/components/ui/input";
import {useErrorHandler} from "@/handler/client/error";
import {Selector} from "@/components/custom/selector";
import {LlmapiRequireField} from "@/modules/llmapis/client/tabs";

const themes = ['system', 'dark', 'light'];

function Tab() {
    const t = useTranslations();
    const {theme, setTheme} = useTheme();
    const {handleError, handleSuccess} = useErrorHandler();
    const {author, setAuthor} = useDefaultSettingState();
    const {llmapi, setLlmapi} = useRemoteSettingState();

    const handleSubmit = async (data: FormData) => {
        try {
            setTheme(data.get('theme') as string);
            setAuthor(data.get('author') as string);
            const llmapi = data.get('llmapi') as string;
            setLlmapi(llmapi ? JSON.parse(llmapi) : null);
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
                                <FieldLabel htmlFor="setting-author">
                                    {t("setting.author")}
                                </FieldLabel>
                                <Input id={"setting-author"} name={"author"}
                                       defaultValue={author}/>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="setting-theme">
                                    {t("setting.theme")}
                                </FieldLabel>
                                <Selector name={`theme`}
                                          id={`setting-theme`}
                                          defaultValue={theme ?? null}
                                          items={themes}/>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="setting-llmapi">
                                    {t("setting.default_llmapi")}
                                </FieldLabel>
                                <LlmapiRequireField
                                    defaultValue={llmapi}
                                    prefix={'setting'}/>
                            </Field>
                        </div>
                    </FieldGroup>
                </FieldSet>
                <Field orientation="horizontal">
                    <Button type="submit">{t("default.save")}</Button>
                </Field>
            </FieldGroup>
        </form>);
}

export const settingTabManager = new TabManager("story tabs", {
    id: 'default',
    label: () => <EntryTabHeader space="setting" value="default" icon={Settings2Icon}/>,
    component: Tab
});