export function tryParseJson(str: string, defaultValue: any = null) {
    try {
        return JSON.parse(str);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
        return defaultValue;
    }
}