'use client';

import {useSse} from "@/utils/sse/client";
import {TaskSseMessage, taskSseMessageId} from "@/utils/models";
import {toast} from "sonner";
import {useTranslations} from "next-intl";

export function useClientUtils() {
    const t = useTranslations();
    useSse<TaskSseMessage>(taskSseMessageId, data => {
        if (data.success) {
            toast.success(t("default.task_success", {target: data.id}), {
                richColors: true,
            });
        } else {
            toast.error(t("default.task_failed", {target: data.id}), {
                richColors: true,
            });
            console.error(t("default.task_failed", {target: data.id}), data.error);
        }
    });
}