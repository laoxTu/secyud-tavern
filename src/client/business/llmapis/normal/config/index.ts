'use client'
import React from "react";
import {ClientRegistry} from "@/client/plugins";
import {Registerable} from "@/shared/register";

export interface LlmapiConfigProps {
    defaultValue: any
}

export interface LlmapiConfig extends Registerable {
    component: React.ComponentType<LlmapiConfigProps>,
    getValue: (data: FormData) => any,
}

export class LlmapiConfigRegistry extends ClientRegistry<LlmapiConfig> {
}

