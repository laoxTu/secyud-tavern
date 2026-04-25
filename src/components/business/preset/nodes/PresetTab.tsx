import {useTranslations} from "next-intl";
import {AppWindowIcon} from "lucide-react";


export default function PresetTab() {
    const t = useTranslations();
    return (
        <>
            <AppWindowIcon/> {t('preset.name')}
        </>
    );

}