import {ApiError} from "@/utils/ApiError";

export class BackendNotAvailableError extends ApiError {
    constructor(message?: string) {
        super({}, 503, message ?? "Backend is not available");

        this.name = "BackendNotAvailableError";

        Object.setPrototypeOf(this, BackendNotAvailableError.prototype);
    }
}