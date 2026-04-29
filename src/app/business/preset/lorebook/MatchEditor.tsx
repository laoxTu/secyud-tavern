import {Registerable, Registry} from "@/models/registerable";
import React from "react";

export interface MatchEditorProps {
    value: any,
    onValueChanged: (value: any) => void
}

export interface MatchEditor extends Registerable {
    component: React.ComponentType<MatchEditorProps>,
    defaultValue: any,
    validate: (value: any) => boolean
}

export class MatchEditorRegistry extends Registry<MatchEditor> {
}

