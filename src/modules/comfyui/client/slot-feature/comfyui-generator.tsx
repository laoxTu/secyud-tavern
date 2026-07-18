import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {EditIcon} from "lucide-react";
import {FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {useRef, useState} from "react";
import {useHistoryPageState} from "@/modules/slots/client/history-pager";
import {useTranslations} from "next-intl";
import {ComfyUIWorkflowCombobox} from "@/modules/comfyui/client/combobox";
import {
    ComfyUIParameterModel,
    ComfyUIWorkflowInput,
    ComfyUIWorkflowModel,
    parameterEntryPlural
} from "@/modules/comfyui/models";
import {useErrorHandler} from "@/handler/client/error";
import {get, post} from "@/client";
import {comfyUIParameterRegistry} from "@/modules/comfyui/client/parameter";
import {BusinessError} from "@/handler/models";

export function ComfyUIGenerator() {
    const t = useTranslations();
    const {page} = useHistoryPageState();
    const {handleError, handleSuccess} = useErrorHandler();
    const [open, setOpen] = useState<boolean>(false);
    const [workflow, setWorkflow] = useState<ComfyUIWorkflowModel | null>(null);
    const [parameters, setParameters] = useState<ComfyUIParameterModel[]>([]);
    const formRef = useRef<HTMLFormElement>(null);

    const handleWorkflowChange = async (workflow: ComfyUIWorkflowModel | null) => {
        try {
            if (!workflow) return;
            workflow = await get('/comfyuis/workflows/{id}', {
                params: {
                    id: workflow.id, withDetails: true
                },
            }) as ComfyUIWorkflowModel;
            if (workflow && workflow.entries && workflow.entries[parameterEntryPlural]) {
                const parameters =
                    (workflow.entries[parameterEntryPlural] as ComfyUIParameterModel[])
                        .filter(u => !u.disabled)
                        .sort((a, b) => a.priority - b.priority);
                setParameters(parameters);
            }
            setWorkflow(workflow);

        } catch (error) {
            handleError(error);
        }
    }

    const handleImageGenerate = async (data: FormData) => {
        if (!workflow) {
            handleError(new BusinessError("workflow is not selected", "comfyui.workflow_need"));
            return;
        }
        let input: ComfyUIWorkflowInput = {};
        try {
            input = JSON.parse(workflow.content.workflow);
        } catch (err) {
            handleError(new BusinessError(String(err), "comfyui.workflow_invalid"));
        }

        try {
            for (const parameter of parameters) {
                const editor = comfyUIParameterRegistry.records[parameter.type];
                if (!editor) {
                    continue;
                }
                editor.setInputData({data, entry: parameter, model: workflow}, input);
            }
            const {prompt_id} = await post('/comfyuis/generate', input);
            console.log(t("comfyui.prompt_sent", {target: prompt_id}));
            handleSuccess(t("comfyui.prompt_sent", {target: prompt_id}));
            setOpen(false)
        } catch (err) {
            handleError(err);
        }
    };

    return (<Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Tooltip/>}>
            <TooltipTrigger onClick={() => setOpen(true)}
                            render={<Button variant="outline"
                                            disabled={page.cur === 0}/>}>
                <EditIcon/>
            </TooltipTrigger>
            <TooltipContent>
                <p>{t('comfyui.generate_img')}</p>
            </TooltipContent>
        </DialogTrigger>
        <DialogContent style={{maxWidth: '86%', height: '86%'}}>
            {history && (
                <form className={'flex flex-col overflow-hidden'}
                      action={handleImageGenerate} ref={formRef}>
                    <DialogHeader>
                        <DialogTitle>{t('comfyui.generate_img')}</DialogTitle>
                    </DialogHeader>
                    <FieldSet className={'overflow-auto p-2 flex-1'}>
                        <FieldGroup>
                            <FieldLabel>
                                {t("comfyui.workflow")}
                            </FieldLabel>
                            <ComfyUIWorkflowCombobox
                                name={'workflow'} id={'workflow-select'}
                                onValueChange={handleWorkflowChange}/>
                        </FieldGroup>
                        {
                            parameters.map(u => {
                                const editor = comfyUIParameterRegistry.records[u.type];
                                const Component = editor.inputComponent;
                                return Component ? <Component key={u.id} formRef={formRef} entry={u}/> : null;
                            })
                        }

                    </FieldSet>
                    <DialogFooter>
                        <Button type="submit">{t('comfyui.generate')}</Button>
                        <DialogClose render={<Button variant="outline"/>}>
                            {t('default.cancel')}
                        </DialogClose>
                    </DialogFooter>
                </form>)}
        </DialogContent>
    </Dialog>)
}