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

export class Check {
    static NotEmpty<T>(fieldName: string, value?: T | null, namespace?: string) {
        if (!value) {
            throw new BusinessError(`No ${fieldName} provided`, "error.empty_field")
                .withValue("field", `${namespace ?? "default"}.${fieldName}`);
        }
    }
}