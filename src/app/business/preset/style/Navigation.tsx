'use client';
import {useTranslations} from "next-intl";
import {PaletteIcon} from "lucide-react";

export default function PresetStyleNavigation() {
    const t = useTranslations();

    return (
        <>
            <PaletteIcon/>
            {t("preset.style")}
        </>
    );
}