import {tryParseJson} from "@/utils";

export class BusinessError extends Error {
    data: Record<string, any> = {};
    code?: string;
    innerError?: any;
    status: number;

    constructor(message: string, code?: string, innerError?: any, status: number = 500) {
        super(message);
        this.code = code;
        this.innerError = innerError;
        this.status = status;
    }

    withValue(key: string, value: any) {
        this.data[key] = value;
        return this;
    }

}

function throwInvalidField(fieldName: string, namespace?: string): string {
    throw new BusinessError(`No ${fieldName} provided`, "error.empty_field")
        .withValue("field", `${namespace ?? "default"}.${fieldName}`);
}

function throwInvalidJson(name?: string): string {
    throw new BusinessError(`Json is invalid`, "error.json_invalid")
        .withValue("target", name ?? "default.field");
}

export const Check = {

    notNullOrEmpty<T>(fieldName: string, value?: T | null, namespace?: string) {
        if (value) return value;
        throwInvalidField(fieldName, namespace);
    },

    notNullOrWhitespace<T>(fieldName: string, value?: string | null, namespace?: string) {
        if (value?.trim()) return value;
        throwInvalidField(fieldName, namespace);
    },

    notEmpty(fieldName: string, value?: string | null, namespace?: string) {
        if (value !== "") return value;
        throwInvalidField(fieldName, namespace);
    },

    notWhitespace(fieldName: string, value?: string | null, namespace?: string) {
        if (value?.trim() !== "") return value;
        throwInvalidField(fieldName, namespace);
    },

    validJson(value?: string | null, name?: string) {
        if (tryParseJson(value)) return value ?? "";
        return throwInvalidJson(name);
    },

    validJsonOrEmpty(value?: string | null, name?: string) {
        if (!value?.trim() || tryParseJson(value)) return value ?? "";
        return throwInvalidJson(name);
    },
} as const;