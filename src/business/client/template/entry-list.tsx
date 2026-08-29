import React, {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {FolderOpenIcon, SearchIcon, XIcon} from "lucide-react";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group";
import {EntryModel} from "@/business/models";
import {PaginationWrapper} from "@/components/custom/pager/component";
import {EntryState, useGlobalEntryState} from "@/business/client/models";
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
    const {items, loading, params, fetch} = usePagedItemsState();
    const {dirty, isDirty} = useGlobalEntryState();

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
        if (modelId !== params.id || isDirty) {
            dirty(false);
            void fetch({params: {entryType: entryState.entryType, id: modelId}});
        }
    }, [modelId, isDirty]);

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

            <div className="flex-1 flex overflow-x-auto scrollbar-none gap-x-2 p-2"
                 key={`entry-loading-${loading}`}>
                {items?.length ? items.map((entry, i) =>
                    <EntryUpdate key={`${entry.entryId}-${i}`} entryState={entryState}
                                 props={updateProps} entry={entry}/>
                ) : <Empty className={"m-auto"}>
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
                </Empty>}
            </div>
            <div className="w-full p-1">
                <PaginationWrapper usePagedItemsState={usePagedItemsState}/>
            </div>
        </div>
    );
}

