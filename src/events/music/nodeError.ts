import { logError } from "../../utils/logUtils";

export default {
    name: "nodeError",
    execute(node: any, error: any) {
        logError(error, `Music Node Error: ${node.identifier}`);
    },
};