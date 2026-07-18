'use client';
import React, {useEffect, useState} from "react";
import {get} from "@/client";
import {useErrorHandler} from "@/handler/client/error";
import {
    Combobox,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList,
    ComboboxValue, useComboboxAnchor
} from "@/components/ui/combobox";
import {useTranslations} from "next-intl";
import {PagedResult} from "@/business/models";
import {ComfyUIModelModel, ComfyUIWorkflowModel} from "@/modules/comfyui/models";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {AspectRatio} from "@/components/ui/aspect-ratio";
import Image from "next/image";

interface ModelComboboxProps {
    defaultValue?: string,
    name?: string,
    type?: string,
    id?: string,
}

/**
 * comfyui 的模型选择
 * 为了配合需要选择模型的情况
 * 懒加载 + 搜索 一般用于生图时切换模型
 * 没有加BaseModel类型限制，
 * 一是不同BaseModel可能公用
 * 二是我没有加这个字段，不好筛选
 * 如果有必要，先加字段，然后再加参数
 */
export function ComfyUIModelCombobox({type, defaultValue, name, id}: ModelComboboxProps) {
    const t = useTranslations();
    const anchor = useComboboxAnchor();
    const {handleError} = useErrorHandler();
    const [searchRequires, setSearchItems] = useState<ComfyUIModelModel[]>([]);
    const [needSearch, setNeedSearch] = useState(true);
    const [searchValue, setSearchValue] = useState<string | undefined>();
    const handleSearchRequires = async (search: string | undefined) => {
        setSearchValue(search);
        setNeedSearch(true);
    };

    useEffect(() => {
        if (!needSearch) return;
        const timer = setTimeout(async () => {
            try {
                const res = await get("/comfyuis/models", {
                    params: {
                        search: {
                            fuzzy: searchValue,
                            types: type ? [type] : [],
                        },
                    }
                }) as PagedResult<ComfyUIModelModel>;
                setSearchItems(res.data);
            } catch (err) {
                handleError(err);
            }
            setNeedSearch(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [handleError, needSearch, searchValue]);

    return (
        <Combobox autoHighlight
                  name={name}
                  id={id}
                  defaultValue={defaultValue}
                  onInputValueChange={e => handleSearchRequires(e)}
                  items={searchRequires}>
            <ComboboxChips ref={anchor} className="w-full">
                <ComboboxValue>
                    {(_) => (
                        <ComboboxChipsInput/>
                    )}
                </ComboboxValue>
            </ComboboxChips>
            <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>{t("default.empty_items")}</ComboboxEmpty>
                <ComboboxList>
                    {(item: ComfyUIModelModel) => {
                        let src = undefined;
                        if (item.content.coverId)
                            src = `/api/images/${item.content.coverId}`;
                        else if (item.content.coverSrc)
                            src = item.content.coverSrc;
                        return (
                            <ComboboxItem key={item.content.path} value={item.content.path}>
                                <HoverCard>
                                    <HoverCardTrigger>
                                        {`${item.content.baseModel}-${item.content.path}-${item.name}`}
                                    </HoverCardTrigger>
                                    <HoverCardContent className={'bg-card w-full'}>
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
                                </HoverCard>
                            </ComboboxItem>
                        );
                    }}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}


interface WorkflowComboboxProps {
    name?: string,
    id?: string,
    value?: ComfyUIWorkflowModel | null,
    onValueChange?: (value: ComfyUIWorkflowModel | null) => void,
}

export function ComfyUIWorkflowCombobox({ name, id, value, onValueChange}: WorkflowComboboxProps) {
    const t = useTranslations();
    const anchor = useComboboxAnchor();
    const {handleError} = useErrorHandler();
    const [items, setItems] = useState<ComfyUIWorkflowModel[]>([]);
    const [needSearch, setNeedSearch] = useState(true);
    const [searchValue, setSearchValue] = useState<string | undefined>();
    const handleSearchRequires = async (search: string | undefined) => {
        setSearchValue(search);
        setNeedSearch(true);
    };

    useEffect(() => {
        if (!needSearch) return;
        const timer = setTimeout(async () => {
            try {
                const res = await get("/comfyuis/workflows", {
                    params: {
                        search: {
                            fuzzy: searchValue,
                        },
                    }
                }) as PagedResult<ComfyUIWorkflowModel>;
                setItems(res.data);
            } catch (err) {
                handleError(err);
            }
            setNeedSearch(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [handleError, needSearch, searchValue]);

    return (<>
        <Combobox autoHighlight
                  name={name}
                  id={id}
                  value={value}
                  itemToStringLabel={item => `${item.code}-${item.name}`}
                  itemToStringValue={item => item.id}
                  onValueChange={onValueChange}
                  onInputValueChange={e => handleSearchRequires(e)}
                  items={items}>
            <ComboboxChips ref={anchor} className="w-full">
                <ComboboxValue>
                    {(_) => (
                        <ComboboxChipsInput/>
                    )}
                </ComboboxValue>
            </ComboboxChips>
            <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>{t("default.empty_items")}</ComboboxEmpty>
                <ComboboxList>
                    {(item: ComfyUIWorkflowModel) =>
                        (
                            <ComboboxItem key={item.id} value={item}>
                                {`${item.code}-${item.name}`}
                            </ComboboxItem>
                        )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    </>);
}