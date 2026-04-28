'use client';
import {useParams, useRouter} from "next/navigation";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {del, get, post} from "@/api/client";
import {PresetModel} from "@/business/preset/models";
import {useErrorHandler} from "@/components/message";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {presetTabManager, usePresetListContext} from "@/app/business/preset";
import {Skeleton} from "@/components/ui/skeleton";
import {PresetContext} from "../Context";
import {Button} from "@/components/ui/button";
import {useTranslations} from "next-intl";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Field, FieldGroup} from "@/components/ui/field";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";

export default function PresetContent() {
    const params = useParams();
    const [preset, setPreset] = useState<PresetModel | undefined>();
    const [initialized, setInitialized] = useState(false);
    const [copyOpen, setCopyOpen] = useState(false);
    const router = useRouter();
    const {handleError} = useErrorHandler();
    const t = useTranslations();

    const id = params.id;
    const tabs = useMemo(() => presetTabManager.getSorted(), [])
    const firstTab = presetTabManager.getFirstTab();
    const {refreshPresetList} = usePresetListContext();

    const refreshPreset = useCallback(() => {
        setInitialized(false);
    }, []);

    const navigateToIndex = useCallback(() => {
        router.replace("/business/preset");
    }, [router])

    const handleExport = useCallback(async () => {
        try {
            if (!preset) return;
            window.open(`/api/presets/${preset.id}/export`)
        } catch (err) {
            handleError(err);
        }
    }, [handleError, preset]);

    // 处理提交
    const handleCopySubmit = async (data: FormData) => {
        try {
            if (!preset) return;
            const code = data.get("code") as string;
            const name = data.get("name") as string;
            const params: PresetModel = {
                ...preset,
                id: "",
                code: code,
                name: name,
            };
            await post("/presets", params);
            setCopyOpen(false);
            refreshPresetList();
        } catch (error) {
            handleError(error);
        }
    };

    const handleDelete = useCallback(async () => {
        try {
            await del('/presets/{id}', {
                method: 'DELETE',
                params: {id}
            })
            navigateToIndex();
            refreshPresetList();
        } catch (err) {
            handleError(err);
        }
    }, [handleError, id, navigateToIndex, refreshPresetList])

    useEffect(() => {
        if (tabs.length === 0 || !id) {
            navigateToIndex();
            return;
        }

        if (initialized) {
            return;
        }

        (async () => {
            try {
                const res = await get('/presets/{id}', {
                    method: 'GET',
                    params: {id}
                }) as PresetModel;
                setPreset(res);
                setInitialized(true)
            } catch (err) {
                handleError(err as Error);
                navigateToIndex();
            }
        })();
    }, [handleError, id, initialized, navigateToIndex, preset, router, tabs.length]);


    if (!preset) {
        return (
            <div className="w-full h-full">
                <div>
                    <Skeleton className="h-10 w-2/3"/>
                </div>
                <div className="p-8">
                    <Skeleton className="h-96 w-full"/>
                </div>
            </div>
        );
    }

    return (
        <PresetContext.Provider value={{preset, refreshPreset}}>
            <Tabs defaultValue={firstTab?.id} key={initialized.toString()}>
                <div className="flex justify-between">
                    <TabsList className="gap-1">
                        {tabs.map((tab, index) => {
                            const Component = tab.label;
                            return (
                                <TabsTrigger key={index} value={tab.id}>
                                    <Component/>
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                    <div className="flex gap-2">
                        <Dialog open={copyOpen} onOpenChange={setCopyOpen}>
                            <Button onClick={handleExport}>{t("default.export")}</Button>
                            <DialogTrigger asChild>
                                <Button variant="secondary">{t("default.copy")}</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form action={handleCopySubmit}
                                      className="form-reset">
                                    <DialogHeader>
                                        <DialogTitle>{t("preset.copy")}</DialogTitle>
                                        <DialogDescription>
                                            {t("preset.copy_description")}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <FieldGroup>
                                        <Field>
                                            <Label htmlFor={`code-preset-copy`}>{t("default.code") + "*"}</Label>
                                            <Input id={`code-preset-copy`} name="code"
                                                   required/>
                                        </Field>
                                        <Field>
                                            <Label htmlFor={`name-preset-copy`}>{t("default.name") + "*"}</Label>
                                            <Input id={`name-preset-copy`} name="name"
                                                   required/>
                                        </Field>
                                    </FieldGroup>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">{t("default.cancel")}</Button>
                                        </DialogClose>
                                        <Button type="submit">{t("default.copy")}</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">{t("default.delete")}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t("preset.delete_title")}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t("preset.delete_description")}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t("default.cancel")}</AlertDialogCancel>
                                    <AlertDialogAction variant={"destructive"}
                                                       onClick={handleDelete}>
                                        {t("default.delete")}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
                {tabs.map((tab, index) => {
                    const Component = tab.component;
                    if (!Component) return null;
                    return (
                        <TabsContent key={index} value={tab.id}
                                     className="h-full w-full p-8">
                            <Component/>
                        </TabsContent>
                    );
                })}
            </Tabs>
        </PresetContext.Provider>
    )
}
