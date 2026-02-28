import { Client } from "discord.js";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { setupGuilds } from "../../utils/dbUtils";
import { initializeActivities } from "../../utils/activityUtils";
import { formatLogTimestamp } from "../../utils/logUtils";

dotenv.config();

export default {
    name: "ready",
    once: true,
    execute(client: Client) {
        console.log(`${formatLogTimestamp()} [INFO] ${client.user?.tag} (${client.user?.id}) online on shard ${client.shard?.ids[0]}.`);

        initializeActivities(client);

        mongoose.set("strictQuery", true);
        mongoose.connect("mongodb://0.0.0.0/ComicallyBot").then(() => {
            console.log(`${formatLogTimestamp()} [SUCCESS] MongoDB connection established.`);
            setupGuilds(client);
        });
    },
};
