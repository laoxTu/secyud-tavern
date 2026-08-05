"use client";
import {useEffect} from "react";
import {useSseConnection} from "@/utils/sse/client/models";

export function useSse<TM>(type: string, func: (data: TM) => void) {
    const connection = useSseConnection();
    useEffect(() => {
        const es = connection.eventSource;
        const callback = (event: MessageEvent) => {
            if (event.type === type) {
                func(JSON.parse(event.data));
            }
        }
        es.addEventListener(type, callback);
        return () => {
            es.removeEventListener(type, callback);
        }
    }, [connection]);
}