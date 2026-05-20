'use client';
import React, {useEffect, useState, useRef, useMemo} from "react";
import {get} from "@/client";
import {StoryIframe} from "@/client/business/slots/story-iframe";
import {useErrorHandler} from "@/client/errors";
import {SlotModel} from "@/shared/business/slots";


export default function StoryPage({params}: { params: { id: string } }) {
    const {id} = params;
    const {handleError} = useErrorHandler();
    const [loading, setLoading] = useState(true);
    const [slot, setSlot] = useState<SlotModel | undefined>(undefined);
    const loadedRef = useRef<string | null>(null);

    useEffect(() => {
        if (loadedRef.current === id) return;
        loadedRef.current = id;

        (async () => {
            try {
                const slot = await get("/stories/{id}/slot", {params: {id}}) as SlotModel;
                setSlot(slot);
            } catch (err) {
                handleError(err as Error);
            } finally {
                setLoading(false);
            }
        })();
    }, [id, handleError]);

    if (loading) return (
        <iframe className={"w-full h-full"} src="/loading.html"></iframe>
    );

    return (
        <div className="w-full h-full">
            <StoryIframe/>
        </div>
    )
}