import * as uncaughtExceptionEvent from "../events/error/uncaughtException";
import * as unhandledRejectionEvent from "../events/error/unhandledRejection";

export function loadProcessErrorHandlers() {
    process.on('uncaughtException', (error: Error) => uncaughtExceptionEvent.default.execute(error));
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => unhandledRejectionEvent.default.execute(reason, promise));
}