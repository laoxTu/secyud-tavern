// components/tab/index.ts
import {Registerable} from "@/src/models/registerable";
import React from "react";
import TabManager from "./manager";

export interface TabConfig<T = undefined> extends Registerable {
    label: string;
    icon?: React.ReactNode;
    component: React.ComponentType<T>;
}

export {TabManager};
