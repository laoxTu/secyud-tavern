import {ArrowBigLeftIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import React from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";


export function NavigateToBusiness() {
    const route = useRouter();
    const t = useTranslations();

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button onClick={() => route.replace("/business")}
                        variant={'outline'}>
                    <ArrowBigLeftIcon/>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{t('slot.back_home_tip')}</p>
            </TooltipContent>
        </Tooltip>);
}
