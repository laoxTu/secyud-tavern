'use client';
import {useTranslations} from "next-intl";
import {FileIcon} from "lucide-react";

export default function PresetNormalNavigation() {
    const t = useTranslations();

    return (
        <>
            <FileIcon/>
            {t("default.property")}
        </>
    );
}