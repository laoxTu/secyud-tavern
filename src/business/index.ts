export class BusinessError extends Error {
    data: Record<string, any> = {};
    code?: string;

    constructor(message: string, code?: string) {
        super(message);
        this.code = code;
    }

    withValue(key: string, value: any) {
        this.data[key] = value;
        return this;
    }
}