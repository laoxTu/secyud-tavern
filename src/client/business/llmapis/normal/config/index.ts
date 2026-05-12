'use client'
import React from "react";
import {ClientRegistry} from "@/client/plugins";
import {Registerable} from "@/shared/register";
import {LlmapiModel} from "@/shared/business/llmapis";

export interface LlmapiConfigProps {
    llmapi: LlmapiModel,
    defaultValue: any,
}

export interface LlmapiConfig extends Registerable {
    component: React.ComponentType<LlmapiConfigProps>,
    getValue: (data: FormData) => any,
}

export class LlmapiConfigRegistry extends ClientRegistry<LlmapiConfig> {
}

