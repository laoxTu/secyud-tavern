'use client'
import {BusinessError} from "../../shared/errors";
export class ApiError extends BusinessError {
    constructor(message: string, code?: string, data?: any) {
        super(message, code);
        if (data) {
            this.data = {...data};
        }
    }
}