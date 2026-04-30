'use client'
import React from "react";
import {ClientRegistry} from "@/client/plugins";
import {Registerable} from "@/shared/register";

export interface MatchEditorProps {
    value: any,
    onValueChanged: (value: any) => void
}

export interface MatchEditor extends Registerable {
    component: React.ComponentType<MatchEditorProps>,
    defaultValue: any,
    validate: (value: any) => boolean
}

export class MatchEditorRegistry extends ClientRegistry<MatchEditor> {
}

