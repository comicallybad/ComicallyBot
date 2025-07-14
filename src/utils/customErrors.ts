import { CustomError } from "../types/customErrors";

export class PermissionError extends Error implements CustomError {
    isCustom: boolean = true;
    name: "PermissionError" = "PermissionError";

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, PermissionError.prototype);
    }
}

export class ValidationError extends Error implements CustomError {
    isCustom: boolean = true;
    name: "ValidationError" = "ValidationError";

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}