import {useTranslations} from "next-intl";
import {Field, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Button} from "@/components/ui/button";
import React from "react";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {PaletteIcon} from "lucide-react";
import {useErrorHandler} from "@/handler/client/error";
import {useComfyUISettingState} from "@/modules/comfyui/client/models";
import {moduleName} from "@/modules/comfyui/models";
import {Input} from "@/components/ui/input";

function Tab() {
    const t = useTranslations();
    const {baseUrl, clientId, modelDir} = useComfyUISettingState();
    const {handleError, handleSuccess} = useErrorHandler();

    const handleSubmit = async (data: FormData) => {
        try {
            useComfyUISettingState.setState({
                baseUrl: data.get("base_url") as string,
                clientId: data.get("client_id") as string,
                modelDir: data.get("model_dir") as string,
            });
            handleSuccess(t("default.saved_successfully"));
        } catch (e) {
            handleError(e);
        }
    }
    return (
        <form action={handleSubmit} className={"h-full"}>
            <FieldGroup className={"flex flex-col h-full"}>
                <FieldSet className={"flex-1 p-2 overflow-auto"}>
                    <FieldGroup>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="setting-comfyui-base_url">
                                    {t("default.base_url")}
                                </FieldLabel>
                                <Input id="setting-comfyui-base_url" name={'base_url'}
                                       defaultValue={baseUrl ?? "http://localhost:8188"}/>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="setting-comfyui-client_id">
                                    {t("comfyui.client_id")}
                                </FieldLabel>
                                <Input id="setting-comfyui-client_id" name={'client_id'}
                                       defaultValue={clientId ?? "secyud-tavern"}/>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="setting-comfyui-model_dir">
                                    {t("comfyui.model_dir")}
                                </FieldLabel>
                                <Input id="setting-comfyui-model_dir" name={'model_dir'}
                                       defaultValue={modelDir ?? "/data"}/>
                            </Field>
                        </div>
                    </FieldGroup>
                </FieldSet>
                <Field orientation="horizontal">
                    <Button type="submit">{t("default.save")}</Button>
                </Field>
            </FieldGroup>
        </form>);
}

export const settingTab = {
    id: moduleName,
    label: () => <EntryTabHeader space="setting" value={moduleName} icon={PaletteIcon}/>,
    component: Tab
};