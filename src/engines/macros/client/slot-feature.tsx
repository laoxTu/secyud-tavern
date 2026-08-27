import {ListIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import React from "react";
import {useTranslations} from "next-intl";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Field, FieldContent, FieldDescription, FieldLabel, FieldLegend, FieldSet} from "@/components/ui/field";
import {enginePlural, PresetMacroModel} from "@/engines/macros/models";
import {MacroConversationCache, MacroConversationCacheItem} from "@/engines/macros/client/conversation";
import {useErrorHandler} from "@/handler/client/error";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {SlotFeature} from "@/modules/stories/client/feeature-models";
import {Separator} from "@/components/ui/separator";
import {Checkbox} from "@/components/ui/checkbox";
import {slotUtils} from "@/modules/stories/client/conversation-models";
import {slotContext} from "@/modules/stories/client/context";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";
import {intersperse} from "@/utils";
import {TextToolTip} from "@/components/custom/text-tool-tip";

export interface MacroSelectorState {
    checkItems: Record<string, boolean>,
    selections: Record<string, string>,
    getSelection: (key: string) => string,
    getCheckItem: (key: string) => boolean,
    setSelection: (key: string, value: string) => void,
    setCheckItem: (key: string, value: boolean) => void,
}

export const useMacroSelectorState = create<MacroSelectorState>()(
    persist((set, get) => {
            return {
                checkItems: {},
                selections: {},
                getSelection: (key) => {
                    return get().selections[key];
                },
                getCheckItem: (key) => {
                    return get().checkItems[key];
                },
                setSelection: (key, value) => {
                    set({
                        selections: {
                            ...get().selections,
                            [key]: value
                        }
                    });
                },
                setCheckItem(key, value) {
                    set({
                        checkItems: {
                            ...get().checkItems,
                            [key]: value
                        }
                    });
                }
            };
        },
        {
            name: "macro_select",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                checkItems: state.checkItems,
                selections: state.selections,
            }),
        }
    )
);


export function MacroSelector() {
    const t = useTranslations();
    const [open, setOpen] = React.useState(false);
    const {handleError} = useErrorHandler();
    const {setSelection, setCheckItem} = useMacroSelectorState();

    const handleDialogOpen = () => {
        try {
            setOpen(true);
        } catch (error) {
            handleError(error);
        }
    };
    const handleSelectChange = (item: MacroConversationCacheItem, id: string) => {
        try {
            const entry = item.singles[id];
            setSelection(item.key, entry.id!)
            item.select = id;
        } catch (error) {
            handleError(error);
        }
    };
    const handleCheckItemChange = (entry: PresetMacroModel, checked: boolean) => {
        try {
            entry.disabled = !checked;
            setCheckItem(entry.id!, checked);
        } catch (error) {
            handleError(error);
        }
    };

    return (<Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Tooltip/>}>
            <Tooltip>
                <TooltipTrigger onClick={() => open ? setOpen(false) : handleDialogOpen()}
                                render={<Button variant="outline"/>}>
                    <ListIcon/>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t('macro.show_selector')}</p>
                </TooltipContent>
            </Tooltip>
        </DialogTrigger>
        <DialogContent className={'flex flex-col overflow-hidden h-5/6'}
                       style={{height: '86%'}}>
            <DialogHeader>
                <DialogTitle>{t('macro.selector')}</DialogTitle>
            </DialogHeader>
            <div className={'overflow-auto p-2 flex-1'}>
                {Object.values(slotUtils.getProperty<MacroConversationCache>(
                    slotContext.slotData.slot, enginePlural).macros)
                    .filter(u => !u.hidden)
                    .map(item => (
                        <FieldSet key={item.key}
                                  className="border rounded-lg bg-card/50 p-4">
                            <FieldLegend className="text-sm font-semibold mb-2">
                                {item.key}
                            </FieldLegend>
                            <RadioGroup value={item.select}
                                        onValueChange={id => handleSelectChange(item, id)}
                                        className="flex flex-col gap-1">
                                {
                                    intersperse(Object.values(item.singles),
                                        (t) => (
                                            <Separator key={`s-${t.id}`} className={'my-1'}/>),
                                        (t) => (
                                            <Field key={t.id}>
                                                <FieldContent className="flex-row p-2">
                                                    <RadioGroupItem id={`macro-${t.id}`}
                                                                    value={t.id}/>
                                                    <FieldLabel htmlFor={`macro-${t.id}`}
                                                                className="m-auto ml-2 flex-1">
                                                        {t.name}
                                                    </FieldLabel>
                                                </FieldContent>
                                                <FieldDescription>
                                                    <TextToolTip text={t.value}/>
                                                </FieldDescription>
                                            </Field>))
                                }
                            </RadioGroup>
                            {
                                intersperse(item.multiples,
                                    (t) => (
                                        <Separator key={`s-${t.id}`} className={'my-1'}/>),
                                    (t) => (
                                        <Field key={t.id}>
                                            <FieldContent
                                                className="flex-row p-2 rounded-md hover:bg-primary-foreground">
                                                <Checkbox id={`macro-${t.id}`}
                                                          checked={!t.disabled}
                                                          onCheckedChange={b => handleCheckItemChange(t, b)}/>
                                                <FieldLabel htmlFor={`macro-${t.id}`}
                                                            className="m-auto ml-2 flex-1">
                                                    {t.name}
                                                </FieldLabel>
                                            </FieldContent>
                                            <FieldDescription>
                                                <TextToolTip text={t.value}/>
                                            </FieldDescription>
                                        </Field>))
                            }
                        </FieldSet>))}
            </div>
        </DialogContent>
    </Dialog>);
}

export const macroSelectorFeature: SlotFeature = {
    id: "MacroSelectorFeature",
    component: MacroSelector,
}