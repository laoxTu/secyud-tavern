import React, {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {FolderOpenIcon, SearchIcon, XIcon} from "lucide-react";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from "@/components/ui/empty";
import {
    InputGroup, InputGroupAddon,
    InputGroupButton, InputGroupInput
} from "@/components/ui/input-group";
import {EntryModel} from "@/business/models";
import {PaginationWrapper} from "@/components/custom/pager/component";
import {EntryState} from "@/business/client/models";
import {EntryUpdate, EntryUpdateProps} from "@/business/client/template/entry-update";
import {EntryCreate, EntryCreateProps} from "@/business/client/template/entry-create";
import {useErrorHandler} from "@/handler/client/error";


interface Props<TEntry> {
    modelId: string,
    entryState: EntryState<TEntry>;
    updateProps: EntryUpdateProps<TEntry>;
    createProps: EntryCreateProps<TEntry>;
}

export function EntryList<TEntry extends EntryModel>(
    {
        modelId,
        entryState,
        updateProps,
        createProps,
    }: Props<TEntry>) {
    const {
        moduleName,
        entryType,
        usePagedItemsState,
    } = entryState;
    const t = useTranslations();
    const [searchInput, setSearchInput] = useState('');
    const {handleError} = useErrorHandler();
    const {items, maxPage, curPage, search, loading, params, fetch} = usePagedItemsState();

    const searchEntries = async (data: FormData) => {
        try {
            await fetch({
                search: data.get("search") as string
            });
        } catch (err) {
            handleError(err);
        }
    }

    const searchReset = async () => {
        try {
            setSearchInput("");
            await fetch({
                search: undefined,
            });
        } catch (err) {
            handleError(err);
        }
    }

    useEffect(() => {
        if (modelId !== params.id) {
            void fetch({params: {entryType: entryState.entryType, id: modelId}});
        }
    }, [modelId]);
    if (maxPage === 0 && !search && !loading) {
        return (<div className={"flex-1 flex pb-24"}>
            <Empty className={"m-auto"}>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <FolderOpenIcon/>
                    </EmptyMedia>
                    <EmptyTitle>{t("default.empty_title", {target: t(`${moduleName}.${entryType}`)})}</EmptyTitle>
                    <EmptyDescription>
                        {t("default.empty_description", {target: t(`${moduleName}.${entryType}`)})}
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center gap-2">
                    <EntryCreate entryState={entryState} props={createProps}/>
                </EmptyContent>
            </Empty>
        </div>);
    }

    return (
        <div className={"flex-1 flex flex-col p-2 gap-1 overflow-y-hidden"} key={`${modelId}-${loading}`}>
            <div className="flex gap-2 flex-row p-2">
                <form action={searchEntries} className={"flex-1"}>
                    <InputGroup>
                        <InputGroupInput name="search" id={`${moduleName}-list-search`}
                                         placeholder={t("default.search")}
                                         value={searchInput}
                                         onChange={(e) => setSearchInput(e.target.value)}/>
                        <InputGroupAddon align={"inline-end"}>
                            <InputGroupButton onClick={searchReset}>
                                <XIcon/>
                            </InputGroupButton>
                            <InputGroupButton type="submit">
                                <SearchIcon/>
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                </form>
                <EntryCreate entryState={entryState} props={createProps}/>
            </div>
            <div className="flex-1 overflow-auto space-y-2 p-2">
                {items && items.map((entry) =>
                    <EntryUpdate key={`${search}-${curPage}-${entry.id}`} entryState={entryState}
                                 props={updateProps} entry={entry}/>
                )}
            </div>
            <div className="w-full p-1">
                <PaginationWrapper usePagedItemsState={usePagedItemsState}/>
            </div>
        </div>
    );
}

