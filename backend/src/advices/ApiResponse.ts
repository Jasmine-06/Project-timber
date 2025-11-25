import { ApiError } from "./ApiError";

class ApiResponse<T> {
    localDate: Date;
    data?: T | null;
    error?: ApiError;

    constructor(data?: T, error?: ApiError) {
        this.localDate = new Date();
        this.data = data;
        this.error = error;

        if(error) {
            this.data = null;
        }
        if(!error && !data) {
            this.data = null;
        }
        else {
            this.data = data;
        }
    }
}

export { ApiResponse };