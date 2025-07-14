import { Client } from "discord.js";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { setupGuilds } from "../../utils/dbUtils";
import { initializeActivities } from "../../utils/activityUtils";
import { ValidationError } from "../../utils/customErrors";

dotenv.config();

export default {
    name: "ready",
    once: true,
    execute(client: Client) {
        const time = new Date();

        console.log(time.toLocaleString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true
        }) + `\n${client.user?.tag} (${client.user?.id}) is online on shard ${client.shard?.ids[0]}.`);

        initializeActivities(client);

        if (!process.env.CLIENT_ID) {
            throw new ValidationError("CLIENT_ID environment variable is not set.");
        }

        client.music.init(process.env.CLIENT_ID);

        mongoose.set("strictQuery", true);
        mongoose.connect("mongodb://0.0.0.0/ComicallyBot").then(() => {
            console.log("Successfully connected to Mongodb");
            setupGuilds(client);
        });
    },
};
