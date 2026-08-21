import React, {useState} from "react";
import {ComfyUIParameterProps} from "@/modules/comfyui/client/parameter-model";
import {Field, FieldLabel} from "@/components/ui/field";
import {parameterEntryName as engineName} from "@/modules/comfyui/models";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {joinAsString} from "@/utils";
import {useErrorHandler} from "@/handler/client/error";
import {CornerDownLeftIcon, SquareStopIcon} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";
import {LlmTextEditorConfig} from "../model";
import {submitTargetFormOnKey} from "@/business/client";
import {useHistoryPageState} from "@/modules/slots/client/history-pager";
import {LlmapiRequireField} from "@/modules/llmapis/client/tabs";
import {spanFull, spanHalf} from "@/components/custom/GridField";
import {slotContext} from "@/modules/slots/client/context";
import {SlotHistory} from "@/modules/models";
import {conversationManager} from "@/modules/slots/client/conversation";
import {create} from "zustand";
import {slotUtils} from "@/modules/slots/client/conversation-models";

export interface LlmTextEditorState {
    signal?: AbortController,
    setSignal: (signal?: AbortController, reason?: string) => void,
}

export const useLlmTextEditorState =
    create<LlmTextEditorState>((set, get) =>
        ({
            setSignal: (signal, reason) => {
                const origin = get().signal;
                if (origin) {
                    origin.abort(reason ?? "reset");
                }
                set({signal});
            },
        }));

export function EditorComponent({entry}: ComfyUIParameterProps) {
    const t = useTranslations();
    const config = entry.config as LlmTextEditorConfig;
    return <>
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
        <LlmapiRequireField defaultValue={config.llmapi ?? null}
                            prefix={`${engineName}-${entry.id}`}/>
        <Field className={spanFull}>
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

export function InputComponent({entry}: ComfyUIParameterProps) {
    const t = useTranslations();
    const config = entry.config as LlmTextEditorConfig;
    const {handleError} = useErrorHandler();
    const [prompt, setPrompt] = useState(config?.textPrompt);
    const [text, setText] = useState("");
    const [output, setOutput] = useState(false);
    const [thinking, setThinking] = useState(false);

    // 生成提示词
    const generateLlmapiPrompt = async () => {
        setOutput(true);
        try {
            const {
                slotData: {slot}, getHistory,
            } = slotContext;

            const history: SlotHistory = {
                inputs: [{
                    content: prompt,
                    variables: [],
                    properties: {}
                }],
                outputs: [],
                outputId: -1,
                summary: false,
                variables: [],
                id: 0,
                disabled: false,
                code: "",
                name: ""
            };

            let thought = "";
            let content = "";
            for await (const {output, outputs} of conversationManager.inputProcesser.requestReply(
                {
                    history,
                    signal: async (signal) => {
                        useLlmTextEditorState.getState().setSignal(signal);
                    },
                    slot: {
                        ...slot,
                        histories: [
                            getHistory(useHistoryPageState.getState().page.cur),
                            history,
                        ],
                        llmapi: await slotUtils.getLlmapi(config?.llmapi, slot),
                    }
                })) {
                if (output.thought === thought) {
                    setThinking(false);
                } else {
                    thought = output.thought;
                    setThinking(true);
                }
                if (output.content !== content) {
                    content = output.content;
                    setText(joinAsString(outputs, "\r\n", u => u.content));
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
        <Field className={spanHalf}>
            <FieldLabel htmlFor={`${engineName}-text-${entry.id}`}>
                {`${entry.name} ${t("comfyui.text_prompt")}`}
            </FieldLabel>
            <Textarea id={`${engineName}-text-${entry.id}`}
                      name={`text_prompt`}
                      value={prompt}
                      onKeyDown={submitTargetFormOnKey}
                      onChange={(e) => setPrompt(e.target.value)}/>
        </Field>
        <Field className={spanHalf}>
            <FieldLabel htmlFor={`${engineName}-text-${entry.id}`}>
                {entry.name}
                {
                    output ?
                        <Button disabled={false}
                                onClick={() => {
                                    useLlmTextEditorState.getState()
                                        .setSignal(undefined, "user canceled.");
                                }}>
                            <SquareStopIcon/>
                        </Button> :
                        <Button onClick={generateLlmapiPrompt}>
                            <CornerDownLeftIcon/>
                        </Button>
                }
                {
                    thinking && (<div className="flex items-center gap-2">
                        <span className="text-gray-500">{t("default.thinking")}</span>
                        <Skeleton className="h-4 w-32"/>
                    </div>)
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