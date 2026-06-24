import {useTranslations} from "next-intl";
import React from "react";

export interface ModelNavigationTemplateProps {
    modelType: string;
}

export function ModelTabHeader({modelType}: ModelNavigationTemplateProps) {
    const t = useTranslations();
    return (
        <>
            {t(`default.${modelType}`)}
        </>
    );
}

export interface EntryNavigationTemplateProps {
    space: string;
    value: string,
    icon: React.ComponentType,
}

export function EntryTabHeader({space, value, icon}: EntryNavigationTemplateProps) {
    const t = useTranslations();
    const Icon = icon;
    return (
        <>
            <Icon/>
            {t(`${space}.${value}`)}
        </>
    );
}