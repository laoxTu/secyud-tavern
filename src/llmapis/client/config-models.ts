'use client'
import React from "react";
import {Registerable} from "@/utils/register";
import {LlmapiModel} from "@/llmapis/models";

export interface LlmapiConfigProps {
    llmapi: LlmapiModel,
    defaultValue: any,
}

export interface LlmapiConfig extends Registerable {
    component: React.ComponentType<LlmapiConfigProps>,
    getValue: (data: FormData) => any,
}