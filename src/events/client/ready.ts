import { Client } from "discord.js";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { setupGuilds } from "../../utils/dbUtils";
import { initializeActivities } from "../../utils/activityUtils";
import { ValidationError } from "../../utils/customErrors";
import { formatLogTimestamp } from "../../utils/logUtils";

dotenv.config();

export default {
    name: "ready",
    once: true,
    execute(client: Client) {
        console.log(`${formatLogTimestamp()} [INFO] ${client.user?.tag} (${client.user?.id}) is online on shard ${client.shard?.ids[0]}`);

        initializeActivities(client);

        if (!process.env.CLIENT_ID) {
            throw new ValidationError("CLIENT_ID environment variable is not set.");
        }

        client.music.init(process.env.CLIENT_ID);

        mongoose.set("strictQuery", true);
        mongoose.connect("mongodb://0.0.0.0/ComicallyBot").then(() => {
            console.log(`${formatLogTimestamp()} [SUCCESS] MongoDB: [CONNECTED]`);
            setupGuilds(client);
        });
    },
};
