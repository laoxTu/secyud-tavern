

export class ApiError extends Error {
    response: Response;

    constructor(response: Response) {
        super("Internal Server Error");
        this.response = response;
    }
}