'use client';
import {useTranslations} from "next-intl";
import Link from "next/link";
import {NavigationMenuLink} from "@/components/ui/navigation-menu";


export default function PresetNavigation() {
    const t = useTranslations();
    return (
        <NavigationMenuLink asChild>
            <Link href="/business/preset">
                {t('preset.name')}
            </Link>
        </NavigationMenuLink>
    );
}