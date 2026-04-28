'use client';
import {useTranslations} from "next-intl";
import {Field, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {PresetModel} from "@/business/preset/models";
import {Button} from "@/components/ui/button";
import {put} from "@/api/client";
import {useErrorHandler} from "@/components/message";
import {useState} from "react";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {usePresetContext} from "@/app/business/preset";
import {RequireModel} from "@/models/require";
import RequiresCombobox from "@/app/business/preset/RequiresCombobox";
import CustomCombobox from "@/components/combobox/CustomCombobox";

export const defaultTags = [
    "theme", "story", "preset"
];

export default function PresetNormalContent() {
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    const router = useRouter();

    const {preset, refreshPreset} = usePresetContext();

    const [tags, setTags] = useState(preset.tags);

    const [selectRequires, setSelectRequires] = useState<RequireModel[]>(preset.requires);

    const handleSubmit = async (data: FormData) => {
        try {
            const name = data.get("name") as string;
            const version = data.get("version") as string;
            const description = data.get("description") as string;
            const params: Partial<PresetModel> = {
                content: {
                    "author": "",
                    "description": description
                },
                version: version,
                name: name,
                requires: selectRequires,
                tags: tags,
            };
            await put("/presets/{id}", params, {
                params: {"id": preset.id,}
            });
            toast.success(t("default.saved_successfully"), {
                richColors: true
            });
            handleReset();
        } catch (error) {
            handleError(error);
        }
    };
    const handleReset = () => {
        router.refresh();
        refreshPreset();
    }

    return (
        <form action={handleSubmit}>
            <FieldGroup>
                <FieldSet>
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
                                <RequiresCombobox
                                    id="preset-normal-requires"
                                    value={selectRequires}
                                    onValueChange={e => setSelectRequires(e)}/>
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
                    <Button type="button" variant={"outline"} onClick={handleReset}>{t("default.reset")}</Button>
                </Field>
            </FieldGroup>
        </form>
    );
}
