'use client';
import React from "react";
import StoryPageContent from "@/modules/stories/client/slot";

export default function StoryPage({params}: { params: Promise<{ id: string }> }) {
    return (<StoryPageContent params={params}/>);
}