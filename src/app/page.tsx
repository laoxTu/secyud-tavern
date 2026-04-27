'use client';
import React from "react";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function Home() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/business/preset'); // 使用 replace 避免后退
    });

    return <div></div>;
}
