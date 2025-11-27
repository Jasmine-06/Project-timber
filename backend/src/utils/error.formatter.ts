import {ZodError} from "zod"

export function zodErrorFormatter(error: ZodError): Record<string, string>{
    const formattedErrors: Record<string, string> = {};

    for (const issue of error.issues){
        //issue.path is an array that shows where the validation error happened.
        const path = issue.path.join('.');  // Converts ["user", "email"] → "user.email"
        formattedErrors[path] = issue.message;
    }
    return formattedErrors;
}