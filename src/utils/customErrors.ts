import { CustomError } from "../types/customErrors";

/**
 * Custom error class for permission-related errors.
 */
export class PermissionError extends Error implements CustomError {
    public isCustom: boolean = true;
    public name: "PermissionError" = "PermissionError";

    /**
     * @param message The error message.
     */
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, PermissionError.prototype);
    }
}

/**
 * Custom error class for validation-related errors.
 */
export class ValidationError extends Error implements CustomError {
    public isCustom: boolean = true;
    public name: "ValidationError" = "ValidationError";

    /**
     * @param message The error message.
     */
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}