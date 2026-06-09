export interface PresetRegexModel {
    pattern: string,
    replacement: string,
    target: string,
    layerMin: number,
    layerMax: number,
}

export const engineName = "regex";
export const engineArrayName = "regexes";