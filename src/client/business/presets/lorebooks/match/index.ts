'use client'
import React from "react";
import {ClientRegistry} from "@/client/plugins";
import {Registerable} from "@/shared/register";

export interface MatchEditorProps {
    defaultValue: any
}

export interface MatchEditor extends Registerable {
    component: React.ComponentType<MatchEditorProps>,
    getValue: (data: FormData) => any,
}

export class MatchEditorRegistry extends ClientRegistry<MatchEditor> {
}

