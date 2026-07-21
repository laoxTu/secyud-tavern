'use client';
import React, {useEffect} from "react";
import {useTranslations} from "next-intl";
import {TabConfig} from "@/components/custom/tab";
import {ModelTabHeader} from "@/business/client/template/tab-header";
import {PaginationWrapper} from "@/components/custom/pager";
import {Item, ItemActions, ItemGroup, ItemHeader} from "@/components/ui/item";
import Image from "next/image";
import {useErrorHandler} from "@/handler/client/error";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {buttonVariants} from "@/components/ui/button";
import {
    LinkIcon,
} from "lucide-react";
import {del} from "@/client";
import Link from "next/link";
import {DeleteDialog} from "@/components/custom/delete-dialog";
import {ImageFile} from "@/business/models";
import {useImagePagedItemsState} from "@/business/client/models";
import {useVisible} from "@/utils/client/visible";


function ContentItem({entry}: { entry: ImageFile }) {
    const t = useTranslations();
    const {handleError, handleSuccess} = useErrorHandler();
    const {fetch} = useImagePagedItemsState();
    const {hide, show, isVisible, className} = useVisible();

    const handleDelete = async () => {
        try {
            await del('/images/{id}', {
                params: {
                    id: entry.id,
                }
            });
            handleSuccess(t("default.delete_successfully"));
            await fetch();
        } catch (error) {
            handleError(error);
        }
    };

    return (<div className={'min-w-1/4 w-96 h-auto p-2'}>
        <Item className={'relative'}
              variant={"outline"}>
            <ItemHeader
                onTouchStart={() => isVisible ? hide() : show()}
                onMouseEnter={show} onMouseLeave={hide}>
                <Image
                    src={`/api/images/${entry.id}`}
                    alt={entry.id}
                    width={100}
                    height={100}
                    className="w-full h-auto rounded-sm"
                />
            </ItemHeader>
            <ItemActions className={`absolute top-4 right-4 rounded bg-white/70 ${className}`}>
                <Tooltip>
                    <TooltipTrigger className={buttonVariants({variant: 'link'})}
                                    render={<Link href={`/api/images/${entry.id}`} target="_blank"/>}>
                        <LinkIcon/>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t("default.link")}</p>
                    </TooltipContent>
                </Tooltip>
                <DeleteDialog handleDelete={handleDelete}
                              itemName={`default.image`}/>
            </ItemActions>
        </Item>
    </div>);
}

export function Content() {
    const {items, fetch} = useImagePagedItemsState();

    useEffect(() => {
        if (!items) {
            void fetch();
        }
    }, []);

    return (<div className={'h-full overflow-hidden flex flex-col gap-2 p-4'}>
        <div className={'flex-1 flex flex-col overflow-hidden'}>
            <div className={'flex-1 overflow-y-auto'}>
                <ItemGroup className={"flex flex-row flex-wrap items-start gap-0"}>
                    {items && items.map((u) => (<ContentItem entry={u} key={u.id}/>))}
                </ItemGroup>
            </div>

            <PaginationWrapper usePagedItemsState={useImagePagedItemsState}/>
        </div>
    </div>)
}

export const tabConfig: TabConfig = {
    id: 'image',
    sequence: 999,
    label: () => <ModelTabHeader modelType={'image'}/>,
    component: Content
}