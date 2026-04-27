// src/app/
'use client';

import React from "react";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {FileTextIcon} from "lucide-react";
import {useTranslations} from "next-intl";


export default function PresetContent() {
    const t = useTranslations();

    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <FileTextIcon/>
                </EmptyMedia>
                <EmptyTitle>{t("preset.select_title")}</EmptyTitle>
                <EmptyDescription>
                    {t("preset.select_description")}
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}
