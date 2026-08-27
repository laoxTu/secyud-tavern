import {ToolboxIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import React from "react";
import {useTranslations} from "next-intl";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Field, FieldContent, FieldDescription, FieldGroup, FieldLabel} from "@/components/ui/field";
import {useErrorHandler} from "@/handler/client/error";
import {SlotFeature} from "@/modules/stories/client/feeature-models";
import {Checkbox} from "@/components/ui/checkbox";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";
import {slotUtils} from "@/modules/stories/client/conversation-models";
import {slotContext} from "@/modules/stories/client/context";
import {ToolConversationCache} from "@/engines/tools/client/conversation";
import {enginePlural} from "@/engines/tools/models";
import {LlmapiTool} from "@/engines/tools/client/models";
import {TextToolTip} from "@/components/custom/text-tool-tip";

export interface ToolSelectorState {
    // 这个因为一开始都是勾选的，直接存disabled
    checkItems: Record<string, true | undefined>,
    setCheckItem: (key: string, value: boolean) => void,
}

export const useToolSelectorState = create<ToolSelectorState>()(
    persist((set, get) => {
            return {
                checkItems: {},
                setCheckItem(key, value) {
                    set({
                        checkItems: {
                            ...get().checkItems,
                            [key]: value ? true : undefined,
                        }
                    });
                }
            };
        },
        {
            name: "tool_select",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                checkItems: state.checkItems,
            }),
        }
    )
);

export function ToolSelector() {
    const t = useTranslations();
    const [open, setOpen] = React.useState(false);
    const {handleError} = useErrorHandler();
    const {setCheckItem} = useToolSelectorState();
    const handleDialogOpen = () => {
        try {
            setOpen(true);
        } catch (error) {
            handleError(error);
        }
    };
    const handleCheckItemChange = (entry: LlmapiTool, checked: boolean) => {
        try {
            entry.disabled = !checked;
            setCheckItem(entry.model.name, !checked);
        } catch (error) {
            handleError(error);
        }
    };

    return (<Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Tooltip/>}>
            <Tooltip>
                <TooltipTrigger onClick={() => open ? setOpen(false) : handleDialogOpen()}
                                render={<Button variant="outline"/>}>
                    <ToolboxIcon/>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t('tool.show_selector')}</p>
                </TooltipContent>
            </Tooltip>
        </DialogTrigger>
        <DialogContent className={'flex flex-col overflow-hidden h-5/6'}
                       style={{height: '86%'}}>
            <DialogHeader>
                <DialogTitle>{t('tool.selector')}</DialogTitle>
            </DialogHeader>
            <FieldGroup className={'overflow-auto p-2 flex-1'}>
                {Object.values(slotUtils.getProperty<ToolConversationCache>(
                    slotContext.slotData.slot, enginePlural).tools)
                    .map(u => (
                        <Field key={u.model.name}>
                            <FieldContent className={'flex-row'}>
                                <Checkbox id={`tool-${u.model.name}`}
                                          checked={!u.disabled}
                                          onCheckedChange={b => handleCheckItemChange(u, b)}/>
                                <FieldLabel htmlFor={`tool-${u.model.name}`}
                                            className="m-auto ml-2 flex-1">
                                    {u.model.name}
                                </FieldLabel>
                            </FieldContent>
                            <FieldDescription>
                                <TextToolTip text={u.model.description}/>
                            </FieldDescription>
                        </Field>))}
            </FieldGroup>
        </DialogContent>
    </Dialog>);
}

export const toolSelectorFeature: SlotFeature = {
    id: "ToolSelectorFeature",
    component: ToolSelector,
}