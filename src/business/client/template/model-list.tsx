'use client';
import React, {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {FolderOpenIcon, SearchIcon, XIcon} from "lucide-react";
import {
    Empty, EmptyContent,
    EmptyDescription, EmptyHeader,
    EmptyMedia, EmptyTitle
} from "@/components/ui/empty";
import {
    InputGroup, InputGroupAddon,
    InputGroupButton, InputGroupInput
} from "@/components/ui/input-group";
import {
    ResizableHandle, ResizablePanel,
    ResizablePanelGroup
} from "@/components/ui/resizable";
import {Item, ItemGroup} from "@/components/ui/item";
import {Skeleton} from "@/components/ui/skeleton";
import {PaginationWrapper} from "@/components/custom/pager";
import {BaseModel} from "@/business/models";
import {useErrorHandler} from "@/handler/client/error";
import {ModelState} from "../models";
import {ModelCreate, ModelCreateProps} from "./model-create";
import {ModelContentProps, ModelContent} from "./model-content";


interface Props<TModel> {
    modelState: ModelState<TModel>;
    createProps: ModelCreateProps<TModel>;
    contentProps: ModelContentProps<TModel>;
    // 额外的搜索内容，FieldGroup的内部内容。
    searchContent?: () => React.ReactNode,
    // 配合额外搜索内容使用
    searchAccessor?: (data: FormData) => any,
    // 显示列表项的元素
    itemContent: (model: TModel) => React.ReactNode,
}

export function ModelList<TModel extends BaseModel>(
    {
        modelState,
        createProps,
        contentProps,
        searchContent,
        searchAccessor,
        itemContent,
    }: Props<TModel>) {

    const {usePagedItemsState, useItemState, moduleName} = modelState;
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    // 受控组件，解决搜索刷新后光标位置问题
    const [searchInput, setSearchInput] = useState('');
    const {items, search, maxPage, loading, fetch} = usePagedItemsState()
    const {model, setModel} = useItemState()

    const applySearch = async (data: FormData) => {
        try {
            await fetch({
                search: {
                    fuzzy: data.get("search") as string,
                    ...searchAccessor?.(data) ?? {}
                }
            });
        } catch (err) {
            handleError(err);
        }
    };

    const resetSearch = async () => {
        try {
            setSearchInput("");
            await fetch({
                ...search ?? {},
                fuzzy: ""
            });
        } catch (err) {
            handleError(err);
        }
    }

    useEffect(() => {
        void fetch();
    }, []);

    return (
        <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel defaultSize="320px"
                            minSize="300px">
                {maxPage === 0 && !search?.fuzzy && !loading ?
                    <div className={"flex h-full pb-24"}>
                        <Empty className={"m-auto"}>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <FolderOpenIcon/>
                                </EmptyMedia>
                                <EmptyTitle>{t("default.empty_title", {target: t(`default.${moduleName}`)})}</EmptyTitle>
                                <EmptyDescription>
                                    {t("default.empty_description", {target: t(`default.${moduleName}`)})}
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent className="flex-row justify-center gap-2">
                                <ModelCreate modelState={modelState} props={createProps}/>
                            </EmptyContent>
                        </Empty>
                    </div> :
                    <div className="flex flex-col p-2 gap-2 h-full">
                        <div className="flex p-2 gap-2">
                            <form action={applySearch} className={"flex-1"}>
                                {searchContent?.()}
                                <InputGroup>
                                    <InputGroupInput name="search" id={`${modelState}-list-search`}
                                                     placeholder={t("default.search")}
                                                     value={searchInput}
                                                     onChange={(e) => setSearchInput(e.target.value)}/>
                                    <InputGroupAddon align={"inline-end"}>
                                        <InputGroupButton onClick={resetSearch}>
                                            <XIcon/>
                                        </InputGroupButton>
                                        <InputGroupButton type="submit">
                                            <SearchIcon/>
                                        </InputGroupButton>
                                    </InputGroupAddon>
                                </InputGroup>
                            </form>
                            <ModelCreate modelState={modelState} props={createProps}/>
                        </div>
                        <div className="flex-1 h-full overflow-auto">
                            <ItemGroup className={"p-2 gap-3"}>
                                {items && items.map((item, i) => (
                                    <Item key={i} asChild
                                          className={item.id === model?.id ? "bg-gray-100" : ""}
                                          variant={"outline"}
                                          role="listitem" onClick={() => setModel(item)}>
                                        <a className={'cursor-pointer'}>
                                            {itemContent(item)}
                                        </a>
                                    </Item>
                                ))}
                            </ItemGroup>
                            {loading && <div className="w-full">
                                <Skeleton className="h-4 w-2/3"/>
                                <Skeleton className="h-4 w-1/2"/>
                                <Skeleton className="aspect-video w-full"/>
                            </div>}
                        </div>
                        <PaginationWrapper usePagedItemsState={usePagedItemsState}/>
                    </div>
                }
            </ResizablePanel>
            <ResizableHandle withHandle/>
            <ResizablePanel minSize="560px">
                <ModelContent<TModel> key={model?.id ?? ""} modelState={modelState} props={contentProps}/>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
