import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

export function TextToolTip({text}: { text?: string }) {
    if (!text) {
        return null;
    }
    return (<>
        {text.substring(0, 32)}
        {text.length > 32 ?
            <Tooltip>
                <TooltipTrigger
                    className="cursor-pointer ml-2 inline-block text-center size-5 m-auto rounded-full border hover:border-primary hover:text-primary"
                    render={<span/>}>
                    ⋯
                </TooltipTrigger>
                <TooltipContent>
                    <p>{text}</p>
                </TooltipContent>
            </Tooltip> : null
        }</>);
}