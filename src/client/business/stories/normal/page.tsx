'use client';
import {useTranslations} from "next-intl";
import {Field, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {FileIcon} from "lucide-react";
import {toast} from "sonner";
import {StoryModel} from "@/shared/business/stories";
import {put} from "@/client";
import {useErrorHandler} from "@/client/errors";
import RequireCombobox from "@/client/business/require-combobox";
import {useStoryContext} from "@/client/business/stories";
import {TabConfig} from "@/client/components/tab";

export const tabConfigId = "normal";


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
    const {story, refreshStory} = useStoryContext();
    if (!story) {
        throw new Error("story.not_found");
    }

    const handleSubmit = async (data: FormData) => {
        try {
            const params: Partial<StoryModel> = {
                content: {
                    "openingRemarks": data.get("openingRemarks") as string
                },
                name: data.get("name") as string,
                requires: data.getAll("require").map(u => JSON.parse(u as string)),
            };
            await put("/stories/{id}", params, {
                params: {"id": story.id,}
            });
            toast.success(t("default.saved_successfully"), {
                richColors: true
            });
            await refreshStory();
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
                                <FieldLabel htmlFor="story-normal-name">
                                    {t("default.name")}
                                </FieldLabel>
                                <Input name="name"
                                       id="story-normal-name"
                                       defaultValue={story.name}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="story-normal-requires">
                                    {t("default.requires")}
                                </FieldLabel>
                                <RequireCombobox
                                    id="story-normal-requires"
                                    name={"require"}
                                    defaultValue={story.requires}/>
                            </Field>
                        </div>
                        <Field>
                            <FieldLabel htmlFor="story-normal-opening_remarks">
                                {t("default.opening_remarks")}
                            </FieldLabel>
                            <Textarea name="openingRemarks"
                                      id="story-normal-opening_remarks"
                                      defaultValue={story.content.openingRemarks ?? ""}
                            />
                        </Field>
                    </FieldGroup>
                </FieldSet>
                <Field orientation="horizontal">
                    <Button type="submit">{t("default.save")}</Button>
                    <Button type="button" variant={"outline"} onClick={refreshStory}>{t("default.reset")}</Button>
                </Field>
            </FieldGroup>
        </form>
    );
}

export const tabConfig: TabConfig = {
    id: tabConfigId, label: Navigation, component: Content
}