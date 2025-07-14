import { logError } from "../../utils/logUtils";

export default {
    name: "nodeError",
    execute(node: any, error: any) {
        logError(`Music Node Connection Error for node: ${node.identifier}`);
    },
};