'use client';
import React from "react";
import {useTranslations} from "next-intl";
import {Settings2Icon} from "lucide-react";
import {TabManager} from "@/components/custom/tab";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {Field, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useTheme} from "next-themes";
import {useDefaultSettingState} from "@/settings/client/models";
import {Input} from "@/components/ui/input";
import {useErrorHandler} from "@/handler/client/error";

const themes = ['system', 'dark', 'light'];

function Tab() {
    const t = useTranslations();
    const {theme, setTheme} = useTheme();
    const {handleError, handleSuccess} = useErrorHandler();
    const {author, setAuthor} = useDefaultSettingState();

    const handleSubmit = async (data: FormData) => {
        try {
            setTheme(data.get('theme') as string);
            setAuthor(data.get('author') as string);
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
                                <Select name="theme" defaultValue={theme}>
                                    <SelectTrigger className="w-full"
                                                   id={`setting-theme`}>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            {themes.map((v) =>
                                                <SelectItem key={v} value={v}>
                                                    {v}
                                                </SelectItem>
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
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