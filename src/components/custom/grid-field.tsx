import React from "react";
import {cn} from "@/lib/utils";

export const spanFull = "md:col-span-2 lg:col-span-4";
export const spanHalf = "lg:col-span-2";
export const rowFull = "row-span-8";
export const rowHalf = "row-span-4";
export const rowQuat = "row-span-2";

export function GridField({children, className}: { children: React.ReactNode, className?: string }) {
    return (<div className={cn('grid md:grid-cols-2 lg:grid-cols-4 gap-4 grid-flow-dense', className)}>
        {children}
    </div>);
}