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

const themes = ['system', 'dark', 'light'];

function Tab() {
    const t = useTranslations();
    const {theme, setTheme} = useTheme();

    const handleSubmit = async (data: FormData) => {
        setTheme(data.get('theme') as string);
    }
    return (
        <form action={handleSubmit} className={"h-full"}>
            <FieldGroup className={"flex flex-col h-full"}>
                <FieldSet className={"flex-1 p-2 overflow-auto"}>
                    <FieldGroup>
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