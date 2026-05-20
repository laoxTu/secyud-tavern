'use client';
import React, {useEffect, useState, useRef} from "react";
import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";


export function StoryIframe() {
    const ref = useRef<HTMLIFrameElement>(null);
    const [srcdoc, setSrcdoc] = useState("");
    const [pageKey, setPageKey] = useState(0);

}
