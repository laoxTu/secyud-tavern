'use client';
import {useTranslations} from "next-intl";
import {Field, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {PresetModel} from "@/business/preset/models";
import {Button} from "@/components/ui/button";
import {put} from "@/api/client";
import {useErrorHandler} from "@/components/message";
import {
    Combobox, ComboboxChip,
    ComboboxChips, ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty, ComboboxItem, ComboboxList,
    ComboboxValue,
    useComboboxAnchor
} from "@/components/ui/combobox";
import {useState} from "react";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {usePresetContext} from "@/app/business/preset";


export default function PresetNormalContent() {
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    const anchor = useComboboxAnchor();
    const router = useRouter();

    const {preset, refreshPreset} = usePresetContext();

    const [tags, setTags] = useState(preset.tags);
    const [tagInput, setTagInput] = useState("");

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
                requires: [],
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
                                <Combobox multiple
                                          autoHighlight
                                          name="tags"
                                          id="preset-normal-tags"
                                          value={tags}
                                          onValueChange={e => setTags(e)}
                                          onInputValueChange={e => setTagInput(e)}
                                          items={[...new Set([...tags, tagInput])]}>
                                    <ComboboxChips ref={anchor} className="w-full">
                                        <ComboboxValue>
                                            {(values) => (
                                                <>
                                                    {values.map((value: string) => (
                                                        <ComboboxChip key={value}>{value}</ComboboxChip>
                                                    ))}
                                                    <ComboboxChipsInput/>
                                                </>
                                            )}
                                        </ComboboxValue>
                                    </ComboboxChips>
                                    <ComboboxContent anchor={anchor}>
                                        <ComboboxEmpty>{t("default.empty_items")}</ComboboxEmpty>
                                        <ComboboxList>
                                            {(item) => (
                                                <ComboboxItem key={item} value={item}>
                                                    {item}
                                                </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
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
