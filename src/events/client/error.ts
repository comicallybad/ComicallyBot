import { logError } from "../../utils/logUtils";

export default {
    name: "error",
    execute(error: Error) {
        logError(error, "Client Error");
    },
};