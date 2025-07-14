import { logError } from "../../utils/logUtils";

export default {
    name: "unhandledRejection",
    execute(reason: any, promise: Promise<any>) {
        logError({ reason, promise }, 'Unhandled Rejection');
    },
};