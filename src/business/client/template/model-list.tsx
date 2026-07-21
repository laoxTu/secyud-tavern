'use client';
import React, {useEffect, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {FolderOpenIcon, FoldHorizontalIcon, SearchIcon, XIcon} from "lucide-react";
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
import {ModelState, useGlobalState} from "../models";
import {ModelCreate, ModelCreateProps} from "./model-create";
import {ModelContentProps, ModelContent} from "./model-content";
import {PanelImperativeHandle} from "react-resizable-panels";
import {Button} from "@/components/ui/button";


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
    const {model, setModel} = useItemState();
    const {
        panelWidth,
        setPanelWidth,
    } = useGlobalState();
    const width = useRef({
        panelWidth,
        update: false
    });
    const leftPanel = useRef<PanelImperativeHandle | null>(null);
    const rightPanel = useRef<PanelImperativeHandle | null>(null);

    const applySearch = async (data: FormData) => {
        try {
            const search = {
                fuzzy: data.get("search") as string,
                ...searchAccessor?.(data) ?? {}
            }
            console.debug("search", search);
            await fetch({search});
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

    const updateWidth = () => {
        if (width.current.update) {
            console.debug("width", width.current.panelWidth);
            setPanelWidth(width.current.panelWidth);
            width.current.update = false;
        }
    }

    const changePanelState =
        (panel: PanelImperativeHandle | null, setCollapsed: (collapsed: boolean) => void) => {
            if (!panel) return;

            if (panel.isCollapsed()) {
                panel.expand();
                setCollapsed(false);
            } else {
                panel.collapse();
                setCollapsed(true);
            }
        }

    useEffect(() => {
        (async () => {
            await fetch();
            const items = usePagedItemsState.getState().items;
            console.debug("items", items);
            if (!useItemState.getState().model &&
                items && items.length > 0) {
                setModel(items[0]);
            }
        })();
    }, []);

    const collapsedSize = 18;

    return (
        <ResizablePanelGroup orientation="horizontal"
                             onPointerUp={updateWidth}>
            <ResizablePanel panelRef={leftPanel}
                            collapsible={true}
                            defaultSize={`${panelWidth}`}
                            minSize={`${collapsedSize}`}
                            onResize={(size) => {
                                width.current.panelWidth = size.asPercentage;
                                width.current.update = true;
                            }}>
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
                        <div className="flex p-2 gap-2 items-center flex-row-reverse">
                            <Button variant={'ghost'} size={'icon'} onClick={() => {
                                changePanelState(rightPanel.current, collapsed => {
                                    setPanelWidth(collapsed ? 100 : 100 - collapsedSize);
                                });
                            }}>
                                <FoldHorizontalIcon/>
                            </Button>
                            <div className={'flex flex-col gap-2'}>
                                <ModelCreate modelState={modelState} props={createProps}/>
                            </div>
                            <div className="flex-1 flex overflow-x-auto scrollbar-none gap-2">
                                <form action={applySearch} className={"w-full flex-1 p-2 space-y-1"}>
                                    {searchContent?.()}
                                    <InputGroup className={'overflow-hidden'}>
                                        <InputGroupInput name="search"
                                                         id={`${modelState.moduleName}-list-search`}
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
                            </div>
                        </div>
                        <div className="flex-1 h-full overflow-auto">
                            <ItemGroup className={"p-2 gap-3"}>
                                {items && items.map((item, i) => (
                                    <Item key={i}
                                          className={`cursor-pointer overflow-hidden${
                                              item.id === model?.id ? " bg-secondary text-secondary-foreground" : ""
                                          }`}
                                          variant={"outline"}
                                          role="listitem" onClick={() => setModel(item)}>
                                        {itemContent(item)}
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
            <ResizablePanel panelRef={rightPanel}
                            collapsible={true}
                            minSize={`${collapsedSize}`}>
                <ModelContent<TModel> key={model?.id ?? ""}
                                      modelState={modelState}
                                      props={contentProps}
                                      collapse={() => {
                                          changePanelState(leftPanel.current, collapsed => {
                                              setPanelWidth(collapsed ? 0 : collapsedSize);
                                          });
                                      }}/>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
