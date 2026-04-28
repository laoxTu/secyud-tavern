'use client';
import {useTranslations} from "next-intl";
import {BookIcon} from "lucide-react";

export default function PresetLorebookNavigation() {
    const t = useTranslations();

    return (
        <>
            <BookIcon/>
            {t("preset.lorebook")}
        </>
    );
}