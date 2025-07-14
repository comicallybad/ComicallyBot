import { logError } from "../../utils/logUtils";

export default {
    name: "uncaughtException",
    execute(error: Error) {
        logError(error, 'Uncaught Exception');
        // It is recommended to exit the process after an uncaught exception
        // as the application state might be corrupted.
        process.exit(1);
    },
};