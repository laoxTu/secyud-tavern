import React from "react";

export function customCreateElement<T extends {}>(
    component?: React.ComponentType<T>,
    props?: T
) {
    return component ? React.createElement(component, props as T) : null;
}