// components/tab/index.ts
import {Registerable} from "@/models/registerable";
import React from "react";
import TabManager from "./manager";

export interface TabConfig extends Registerable {
    label: React.ComponentType;
    component?: React.ComponentType;
}

export {TabManager};
