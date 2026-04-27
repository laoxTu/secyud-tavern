// components/tab/index.ts
import {Registerable} from "@/models/registerable";
import React from "react";
import TabManager from "./manager";

export interface TabConfig<T = undefined> extends Registerable {
    label: React.ComponentType<T>;
    component?: React.ComponentType<T>;
}

export {TabManager};
