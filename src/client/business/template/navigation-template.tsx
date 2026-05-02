import {useTranslations} from "next-intl";
import React from "react";

export interface ModelNavigationTemplateProps {
    modelType: string;
}

export function ModelNavigationTemplate({modelType}: ModelNavigationTemplateProps) {
    const t = useTranslations();
    return (
        <>
            {t(`default.${modelType}`)}
        </>
    );
}

export interface EntryNavigationTemplateProps {
    modelType: string;
    entryType: string,
    icon: React.ComponentType,
}

export function EntryNavigationTemplate({modelType, entryType, icon}: EntryNavigationTemplateProps) {
    const t = useTranslations();
    const Icon = icon;
    return (
        <>
            <Icon/>
            {t(`${modelType}.${entryType}`)}
        </>
    );
}