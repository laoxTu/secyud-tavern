import {ComfyUIModelModel} from "@/modules/comfyui/models";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {AspectRatio} from "@/components/ui/aspect-ratio";
import Image from "next/image";


export function ComfyUIHoverableItem({item}: { item: ComfyUIModelModel }) {
    let src = undefined;
    if (item.content.coverId)
        src = `/api/images/${item.content.coverId}`;
    else if (item.content.coverSrc)
        src = item.content.coverSrc;
    return (<HoverCard>
        <HoverCardTrigger>
            {`${item.content.baseModel}-${item.code}`}
        </HoverCardTrigger>
        <HoverCardContent className={'bg-card w-full'}>
            <div>
                {`${item.content.baseModel}-${item.content.path}-${item.name}`}
            </div>
            {src && <AspectRatio ratio={1}>
                {src.endsWith('mp4') ?
                    <video src={src} controls preload="metadata"
                           className="object-cover rounded-sm aspect-square"/> :
                    <Image
                        src={src}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-cover rounded-sm"
                    />}
            </AspectRatio>}
            <div dangerouslySetInnerHTML={{__html: item.content.html}}/>
        </HoverCardContent>
    </HoverCard>);
}