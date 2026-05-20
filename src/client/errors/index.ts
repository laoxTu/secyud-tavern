'use client';
import {useCallback} from "react";
import {ApiError} from "../models";
import {toast} from "sonner";
import {useTranslations} from "next-intl";

export function useErrorHandler() {
    const t = useTranslations();

    const handleError = useCallback((err: any) => {
        if (err instanceof ApiError) {
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