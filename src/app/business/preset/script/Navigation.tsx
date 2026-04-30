'use client';
import {useTranslations} from "next-intl";
import {FileCode2Icon} from "lucide-react";

export default function PresetScriptNavigation() {
    const t = useTranslations();

    return (
        <>
            <FileCode2Icon/>
            {t("preset.script")}
        </>
    );
}