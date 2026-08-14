import {interceptor} from "@/handler/server/interceptor";
import {NextResponse} from "next/server";
import {settingRepository} from "@/modules/settings/server/repository";
import {BusinessError} from "@/handler/models";

/**
 * @body any
 * @openapi
 */
export const POST = interceptor.createRoute(
    async (request) => {
        const prompt = await request.json();
        const setting = await settingRepository.get("comfyuiSettingState");
        const {state: {baseUrl, clientId}} = setting?.data ? JSON.parse(setting.data) : {
            state: {
                baseUrl: "http://localhost:8188",
                clientId: "secyud-tavern"
            }
        };
        const body = JSON.stringify({
            client_id: clientId,
            prompt: prompt
        })
        console.info(`[comfyui]: send prompt: `, body);
        const response = await fetch(`${baseUrl}/prompt`, {
            method: "POST",
            body,
        })
        const res = await response.json();

        if (res.error) {
            throw new BusinessError(res.error?.message, "comfyui.request_error")
                .withValue("message", res.error?.message);
        }

        return NextResponse.json(res);
    }
)
