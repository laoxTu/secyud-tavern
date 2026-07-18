import React, {RefObject, useState} from "react";
import {ComfyUIParameterProps} from "@/modules/comfyui/client/parameter-model";
import {Field, FieldLabel} from "@/components/ui/field";
import {parameterEntryName as engineName} from "@/modules/comfyui/models";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {getSlotAndHistories, SlotDataModel, useSlotContext} from "@/modules/slots/client/models";
import {readStream} from "@/utils";
import {
    LlmapiInputContext,
} from "@/modules/slots/client/conversation-models";
import {
    conversationManager
} from "@/modules/slots/client/conversation";
import {post} from "@/client";
import {LlmapiInputModel} from "@/modules/slots/models";
import {useErrorHandler} from "@/handler/client/error";
import {CornerDownLeftIcon, SquareStopIcon} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";
import {LlmTextEditorConfig} from "../model";
import {submitTargetFormOnKey} from "@/business/client";
import {useHistoryPageState} from "@/modules/slots/client/history-pager";
import {StoryHistory} from "@/modules/stories/models";


export function EditorComponent({entry}: ComfyUIParameterProps) {
    const t = useTranslations();
    const config = entry.config as LlmTextEditorConfig;
    return <>
        <div className="grid md:grid-cols-2 gap-4">
            <Field>
                <FieldLabel htmlFor={`${engineName}-node_id-${entry.id}`}>
                    {t("comfyui.node_id")}
                </FieldLabel>
                <Input name={"node_id"} defaultValue={config?.nodeId}
                       id={`${engineName}-node_id-${entry.id}`}/>
            </Field>
            <Field>
                <FieldLabel htmlFor={`${engineName}-node_name-${entry.id}`}>
                    {t("comfyui.node_name")}
                </FieldLabel>
                <Input name={"node_name"} defaultValue={config?.nodeName}
                       id={`${engineName}-node_name-${entry.id}`}/>
            </Field>
        </div>
        <Field>
            <FieldLabel htmlFor={`${engineName}-text-${entry.id}`}>
                {t("comfyui.text_prompt")}
            </FieldLabel>
            <Textarea id={`${engineName}-text-${entry.id}`}
                      name={`text_prompt`}
                      defaultValue={config?.textPrompt}
                      onKeyDown={submitTargetFormOnKey}/>
        </Field>
    </>;
}

export function getReplyAbortController(ctx: RefObject<SlotDataModel>) {
    return ctx.current.content["ComfyUIAbortController"] as AbortController
}

export function setReplyAbortController(ctx: RefObject<SlotDataModel>) {
    let controller = getReplyAbortController(ctx);
    if (controller) {
        controller.abort("reset");
    }
    controller = new AbortController();
    ctx.current.content["ComfyUIAbortController"] = controller;
    return controller;
}

export function InputComponent({entry}: ComfyUIParameterProps) {
    const t = useTranslations();
    const config = entry.config as LlmTextEditorConfig;
    const {handleError} = useErrorHandler();

    const ctx = useSlotContext();
    const [prompt, setPrompt] = useState(config?.textPrompt);
    const [text, setText] = useState("");
    const [output, setOutput] = useState(false);
    const [thinking, setThinking] = useState(false);

    // 生成提示词
    const generateLlmapiPrompt = async () => {
        try {
            const {slot, histories} = getSlotAndHistories(ctx);
            const iframe = ctx.current.iframe.current;
            const page = useHistoryPageState.getState().page;
            if (!iframe) {
                console.debug('[HistoryChatbox] failed to get history or iframe');
                return;
            }

            const historiesAdd = [];
            if (histories.length > page.cur && page.cur >= 0) {
                historiesAdd.push(histories[page.cur]);
            }

            setOutput(true);

            const input: StoryHistory = {
                inputs: [{
                    id: 0,
                    content: prompt,
                    variables: [],
                    properties: {}
                }],
                outputs: [],
                outputId: 0,
                summary: false,
                variables: [],
                id: 0,
                disabled: false,
                code: "",
                name: ""
            };

            historiesAdd.push(input);

            const inputContext: LlmapiInputContext = {
                slot,
                content: {},
                history: input,
                histories: historiesAdd.map(u => ({
                    ...u,
                    inputs: u.inputs
                        .map(v => ({...v})),
                    outputs: u.outputs
                        .map(v => ({...v})),
                    properties: {}
                })),
                messages: [],
            };

            await conversationManager.inputProcesser.use(provider =>
                provider.onProcessInput(inputContext));

            const reply = setReplyAbortController(ctx);

            // 生图提示词放最后, 优先级最高
            inputContext.messages.push({
                content: prompt, role: "user"
            })

            console.debug("[LlmTextEditor] chat messages: ", inputContext.messages);
            const response: Response = await post(
                `/llmapis/{id}/chat` as any,
                {messages: inputContext.messages} as LlmapiInputModel,
                {
                    params: {id: slot.llmapi.id},
                    signal: reply.signal
                }
            );

            if (response.body) {
                let content = "";

                for await (const chunk of readStream(response.body)) {
                    if (reply.signal.aborted) {
                        console.warn('[HistoryChatbox] reply canceled');
                        break;
                    }
                    if (chunk?.reasoning_content) {
                        setThinking(true);
                    }
                    if (chunk?.content) {
                        setThinking(false);
                        content += chunk.content;
                        setText(content);
                    }
                }
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                console.log('user abort reply');
                return; // 或者不处理
            }
            handleError(err);
        } finally {
            setOutput(false);
            setThinking(false);
        }
    };

    return <>
        <Field>
            <FieldLabel htmlFor={`${engineName}-text-${entry.id}`}>
                {`${entry.name} ${t("comfyui.text_prompt")}`}
            </FieldLabel>
            <Textarea id={`${engineName}-text-${entry.id}`}
                      name={`text_prompt`}
                      value={prompt}
                      onKeyDown={submitTargetFormOnKey}
                      onChange={(e) => setPrompt(e.target.value)}/>
        </Field>
        <Field>
            <FieldLabel htmlFor={`${engineName}-text-${entry.id}`}>
                {entry.name}
                {
                    output ?
                        <Button disabled={false}
                                onClick={() => {
                                    const controller = getReplyAbortController(ctx);
                                    controller.abort("user canceled.");
                                }}>
                            <SquareStopIcon/>
                        </Button> :
                        <Button onClick={generateLlmapiPrompt}>
                            <CornerDownLeftIcon/>
                        </Button>
                }
                {
                    thinking ? <Skeleton className="h-4 w-62.5"/> : <></>
                }
            </FieldLabel>
            <Textarea id={`${engineName}-text-${entry.id}`}
                      name={`text_${entry.id}`}
                      value={text}
                      onKeyDown={submitTargetFormOnKey}
                      onChange={(e) => setText(e.target.value)}/>
        </Field>
    </>;
}