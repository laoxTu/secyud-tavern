'use client';
import {useCallback} from "react";
import {toast} from "sonner";
import {useTranslations} from "next-intl";
import {BusinessError} from "@/handler/models";

export function isNetworkError(error: unknown): boolean {
    if (error instanceof TypeError) {
        return error.message === 'Failed to fetch'
            || error.message.includes('NetworkError');
    }
    return false;
}

export function isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError';
}

export function isHttpError(error: unknown): boolean {
    // 假设 error 有 status 或 response.status
    const status = (error as any)?.response?.status || (error as any)?.status;
    return typeof status === 'number' && status >= 400;
}

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
                toast.error(t(err.code, record), {
                    richColors: true,
                });
                return;
            }
            // 默认错误消息
            toast.error(err.message, {
                richColors: true,
            });
        } else if (isNetworkError(err)) {
            // 网络错误 → 静默处理
            console.error(err);
        } else if (isHttpError(err)) {
            // HTTP 错误 → 根据状态码处理
            console.error(err);
        } else {
            throw err;
        }
    }, [t]);

    const handleSuccess = (message: string) => {
        toast.success(message, {
            richColors: true,
        });
    }

    return {handleError, handleSuccess};
}