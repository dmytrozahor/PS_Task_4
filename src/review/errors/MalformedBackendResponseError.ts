import {ApiError} from "@/utils/ApiError";

export class MalformedBackendResponseError extends ApiError {
    constructor(message?: string) {
        super({}, 503, message ?? "Backend is not available");

        this.name = "MalformedBackendResponseError";

        Object.setPrototypeOf(this, MalformedBackendResponseError.prototype);
    }
}