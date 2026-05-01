'use client';
import {MatchEditorProps, MatchEditor} from ".";
import {CustomCombobox} from "@/client/components/combobox";
import {Field, FieldLabel} from "@/components/ui/field";
import React from "react";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

interface EventMatchProperty {
    yearS: number;
    yearE: number;
    monthS: number;
    monthE: number;
    keywords: string[];
}

const configId = "event";

function Content({defaultValue}: MatchEditorProps) {
    const t = useTranslations();
    const {yearS = 0, yearE = 0, monthS = 1, monthE = 1, keywords = []} =
        defaultValue as EventMatchProperty;

    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <Field>
                    <FieldLabel htmlFor={"lorebook-year_start"}>
                        {t("lorebook.year_start")}
                    </FieldLabel>
                    <Input id={"lorebook-year_start"} type={"number"}
                           defaultValue={yearS} name={"yearS"}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={"lorebook-month_start"}>
                        {t("lorebook.month_start")}
                    </FieldLabel>
                    <Select name="monthS" defaultValue={monthS.toString()}>
                        <SelectTrigger className="w-full"
                                       id={"lorebook-month_start"}>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectGroup>
                                <SelectItem value={"1"}> 1 </SelectItem>
                                <SelectItem value={"2"}> 2 </SelectItem>
                                <SelectItem value={"3"}> 3 </SelectItem>
                                <SelectItem value={"4"}> 4 </SelectItem>
                                <SelectItem value={"5"}> 5 </SelectItem>
                                <SelectItem value={"6"}> 6 </SelectItem>
                                <SelectItem value={"7"}> 7 </SelectItem>
                                <SelectItem value={"8"}> 8 </SelectItem>
                                <SelectItem value={"9"}> 9 </SelectItem>
                                <SelectItem value={"10"}> 10 </SelectItem>
                                <SelectItem value={"11"}> 11 </SelectItem>
                                <SelectItem value={"12"}> 12 </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
                <Field>
                    <FieldLabel htmlFor={"lorebook-year_end"}>
                        {t("lorebook.year_end")}
                    </FieldLabel>
                    <Input id={"lorebook-year_end"} type={"number"}
                           defaultValue={yearE} name={"yearE"}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={"lorebook-month_end"}>
                        {t("lorebook.month_end")}
                    </FieldLabel>
                    <Select name="monthE" defaultValue={monthE.toString()}>
                        <SelectTrigger className="w-full"
                                       id={"lorebook-month_end"}>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectGroup>
                                <SelectItem value={"1"}> 1 </SelectItem>
                                <SelectItem value={"2"}> 2 </SelectItem>
                                <SelectItem value={"3"}> 3 </SelectItem>
                                <SelectItem value={"4"}> 4 </SelectItem>
                                <SelectItem value={"5"}> 5 </SelectItem>
                                <SelectItem value={"6"}> 6 </SelectItem>
                                <SelectItem value={"7"}> 7 </SelectItem>
                                <SelectItem value={"8"}> 8 </SelectItem>
                                <SelectItem value={"9"}> 9 </SelectItem>
                                <SelectItem value={"10"}> 10 </SelectItem>
                                <SelectItem value={"11"}> 11 </SelectItem>
                                <SelectItem value={"12"}> 12 </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
            </div>
            <Field>
                <FieldLabel htmlFor={"lorebook-keyword"}>
                    {t("lorebook.include_any_word")}
                </FieldLabel>
                <CustomCombobox id={"lorebook-keyword"} name={"keyword"}
                                defaultValue={keywords}/>
            </Field>
        </>
    );
}

export const config: MatchEditor =
    {
        id: configId,
        component: Content,
        getValue: (data) => {
            const res: EventMatchProperty = {
                keywords: data.getAll("keyword") as string[],
                monthE: parseInt(data.get("monthE") as string),
                monthS: parseInt(data.get("monthS") as string),
                yearE: parseInt(data.get("yearE") as string),
                yearS: parseInt(data.get("yearS") as string),
            }
            return res;
        }
    } as const;