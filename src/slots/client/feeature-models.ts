import {Registerable} from "@/utils/register";
import React from "react";

export interface SlotFeature extends Registerable {
    component: React.ComponentType;
}