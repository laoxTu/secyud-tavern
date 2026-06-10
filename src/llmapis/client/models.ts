'use client';
import {createModelContextType, useModelContext} from "@/components/template/models";
import {LlmapiModel, moduleName} from "../models";

export const LlmapiContext = createModelContextType<LlmapiModel>();
export const useLlmapiContext = (t: any) =>
    useModelContext<LlmapiModel>(LlmapiContext, moduleName, t);

