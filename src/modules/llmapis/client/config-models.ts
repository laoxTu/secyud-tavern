'use client'
import {Registerable} from "@/utils/register";
import {StoryOutputMessage} from "@/modules/stories/models";
import React from "react";

export interface LlmapiConfig extends Registerable {
    component: React.ComponentType,
    getValue: (data: FormData) => any,
    generateOutput: (output: any, context: StoryOutputMessage, cache: Record<string, any>) => void,
}
