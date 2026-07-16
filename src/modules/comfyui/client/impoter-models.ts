'use client';
import {Registerable} from "@/utils/register";
import {ComfyUIModelModel} from "@/modules/comfyui/models";
import React from "react";

export interface ComfyUIModelImporter extends Registerable {
    generate: (data: FormData) => Promise<ComfyUIModelModel[]>;
    component: React.ComponentType,
}