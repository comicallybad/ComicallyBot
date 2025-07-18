/**
 * Base interface for custom error classes in the application.
 */
export interface CustomError extends Error {
    /**
     * Indicates whether the error is a custom error.
     */
    isCustom: boolean;
}

/**
 * Represents an error thrown when the bot or a user lacks necessary Discord permissions.
 */
export interface PermissionError extends CustomError {
    /**
     * The name of the error, always "PermissionError".
     */
    name: "PermissionError";
}

/**
 * Represents an error thrown for invalid user input, incorrect command usage,
 * or operational conditions that prevent command execution.
 */
export interface ValidationError extends CustomError {
    /**
     * The name of the error, always "ValidationError".
     */
    name: "ValidationError";
}