'use client';
import {useTranslations} from "next-intl";
import {Field, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {FileIcon} from "lucide-react";
import {useState} from "react";
import {toast} from "sonner";
import {RequireModel} from "@/shared/business";
import {PresetModel} from "@/shared/business/presets";
import {put} from "@/client";
import {useErrorHandler} from "@/client/errors";
import RequireCombobox from "@/client/business/require-combobox";
import {usePresetContext} from "@/client/business/presets";
import {CustomCombobox} from "@/client/components/combobox";
import {TabConfig} from "@/client/components/tab";

export const tabConfigId = "normal";

export const defaultTags = [
    "theme", "story", "preset"
];

function Navigation() {
    const t = useTranslations();

    return (
        <>
            <FileIcon/>
            {t("default.property")}
        </>
    );
}

function Content() {
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    const {preset, refreshPreset} = usePresetContext();
    if (!preset) {
        throw new Error("preset.not_found");
    }

    const [tags, setTags] = useState(preset.tags);
    const [requires, setRequires] = useState<RequireModel[]>(preset.requires);
    const handleSubmit = async (data: FormData) => {
        try {
            const params: Partial<PresetModel> = {
                content: {
                    "description": data.get("description") as string
                },
                version: data.get("version") as string,
                name: data.get("name") as string,
                requires: requires,
                tags: tags,
            };
            await put("/presets/{id}", params, {
                params: {"id": preset.id,}
            });
            toast.success(t("default.saved_successfully"), {
                richColors: true
            });
            await refreshPreset();
        } catch (error) {
            handleError(error);
        }
    };

    return (
        <form className={"h-full"}
              action={handleSubmit}>
            <FieldGroup className={"flex flex-col h-full"}>
                <FieldSet className={"flex-1 p-2 overflow-auto"}>
                    <FieldGroup>
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="preset-normal-code">
                                    {t("default.code")}
                                </FieldLabel>
                                <Input disabled name="code"
                                       id="preset-normal-code"
                                       defaultValue={preset.code}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="preset-normal-author">
                                    {t("default.author")}
                                </FieldLabel>
                                <Input disabled name="author"
                                       id="preset-normal-author"
                                       defaultValue={preset.content.author}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="preset-normal-name">
                                    {t("default.name")}
                                </FieldLabel>
                                <Input name="name"
                                       id="preset-normal-name"
                                       defaultValue={preset.name}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="preset-normal-version">
                                    {t("default.version")}
                                </FieldLabel>
                                <Input name="version"
                                       id="preset-normal-version"
                                       defaultValue={preset.version}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="preset-normal-tags">
                                    {t("default.tags")}
                                </FieldLabel>
                                <CustomCombobox value={tags} onValueChange={e => setTags(e)}
                                                id="preset-normal-tags" extraValue={defaultTags}/>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="preset-normal-requires">
                                    {t("default.requires")}
                                </FieldLabel>
                                <RequireCombobox
                                    id="preset-normal-requires"
                                    value={requires}
                                    onValueChange={e => setRequires(e)}/>
                            </Field>
                        </div>
                        <Field>
                            <FieldLabel htmlFor="preset-normal-description">
                                {t("default.description")}
                            </FieldLabel>
                            <Textarea name="description"
                                      id="preset-normal-description"
                                      defaultValue={preset.content.description ?? ""}
                            />
                        </Field>
                    </FieldGroup>
                </FieldSet>
                <Field orientation="horizontal">
                    <Button type="submit">{t("default.save")}</Button>
                    <Button type="button" variant={"outline"} onClick={refreshPreset}>{t("default.reset")}</Button>
                </Field>
            </FieldGroup>
        </form>
    );
}
export const tabConfig: TabConfig = {
    id: tabConfigId, label: Navigation, component: Content
}