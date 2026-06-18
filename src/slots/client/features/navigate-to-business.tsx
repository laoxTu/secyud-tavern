import {ArrowBigLeftIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import React from "react";
import {useRouter} from "next/navigation";
import {SlotFeature} from "@/slots/client/feeature-models";


export function NavigateToBusiness() {
    const route = useRouter();

    return (<Button onClick={() => route.replace("/business")}
                    variant={'outline'}>
        <ArrowBigLeftIcon/>
    </Button>);
}

export const navigateToBusinessFeature: SlotFeature = {
    id: "NavigateToBusiness",
    component: NavigateToBusiness,
}