'use client';
import React from "react";
import StoryPageContent from "@/modules/slots/client/content";

export default function StoryPage({params}: { params: Promise<{ id: string }> }) {
    return (<StoryPageContent params={params}/>);
}