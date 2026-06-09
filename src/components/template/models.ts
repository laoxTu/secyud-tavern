import {Context, createContext, useContext} from "react";

export interface ModelContextType<TModel> {
    model?: TModel;
    setModel: (story?: TModel) => void;
    refreshModel: () => Promise<void>;
    refreshModelList: () => Promise<void>;
}

export function createModelContextType<TModel>() {
    return createContext<ModelContextType<TModel> | undefined>(undefined)
}

export function useModelContext<TModel>(
    contextType: Context<ModelContextType<TModel> | undefined>, modelType: string, t: any) {
    const context = useContext(contextType);
    if (!context) {
        throw new Error(t("default.context_not_found", {target: t(`default.${modelType}`)}));
    }
    return context;
}