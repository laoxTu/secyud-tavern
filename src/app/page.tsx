'use client';
import React, {useEffect} from "react";
import {useRouter} from 'next/navigation';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        router.replace(`/business`); // 使用 replace 避免后退
    });

    return <div></div>;
}
