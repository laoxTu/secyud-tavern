'use client';
import {useCallback} from "react";
import {toast} from "sonner";
import {useTranslations} from "next-intl";
import {BusinessError} from "@/handler/models";

export function useErrorHandler() {
    const t = useTranslations();

    const handleError = useCallback((err: any) => {
        if (err instanceof BusinessError) {
            console.error(err);
            if (err.code) {
                const record: Record<string, any> = {};
                if (err.data) {
                    for (const key in err.data) {
                        const value = err.data[key];
                        if (typeof value === "string") {
                            record[key] = t.has(value) ? t(value) : value;
                        } else record[key] = value;
                    }
                }
                console.debug("record" + JSON.stringify(record));
                toast.error(t(err.code, record), {
                    richColors: true,
                });
                return;
            }
            // 默认错误消息
            toast.error(err.message, {
                richColors: true,
            });
        } else {
            throw err;
        }
    }, [t]);

    return {handleError};
}