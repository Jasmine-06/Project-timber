import { ApiError } from "./ApiError";

class ApiResponse<T> {
    localDate: Date;
    data?: T | null;
    apiError?: ApiError;

    constructor(data?: T, apiError?: ApiError) {
        this.localDate = new Date();
        this.data = data;
        this.apiError = apiError;

        if(apiError) {
            this.data = null;
        }
        if(!apiError && !data) {
            this.data = null;
        }
        else {
            this.data = data;
        }
    }
}

export { ApiResponse };