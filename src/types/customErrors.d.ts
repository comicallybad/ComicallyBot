export interface CustomError extends Error {
    isCustom: boolean;
}

export interface PermissionError extends CustomError {
    name: "PermissionError";
}

export interface ValidationError extends CustomError {
    name: "ValidationError";
}