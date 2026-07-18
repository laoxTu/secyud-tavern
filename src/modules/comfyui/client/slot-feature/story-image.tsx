import {Content} from "@/modules/stories/client/image-tab";
import {
    Dialog,
    DialogContent,
    DialogTrigger
} from "@/components/ui/dialog";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {EditIcon} from "lucide-react";
import {useState} from "react";
import {useTranslations} from "next-intl";


export function StoryImage() {
    const t = useTranslations();
    const [open, setOpen] = useState<boolean>(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Tooltip/>}>
                <TooltipTrigger onClick={() => setOpen(true)}
                                render={<Button variant="outline"/>}>
                    <EditIcon/>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t('story.image')}</p>
                </TooltipContent>
            </DialogTrigger>
            <DialogContent className={'max-w-11/12'}>
                <Content/>
            </DialogContent>
        </Dialog>
    );
}
