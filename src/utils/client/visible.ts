'use client';


import {useEffect, useRef, useState} from "react";

export function useVisible() {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const show = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsVisible(true);
    };

    const hide = () => {
        // 延迟隐藏，避免触摸时闪烁
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 100);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        isVisible, setIsVisible, hide, show,
        className: isVisible ? "" : "hidden",
    };
}