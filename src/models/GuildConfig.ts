import { Schema, model, Types } from "mongoose";
import { IGuildConfig } from "../types/GuildConfig.d";

const GuildConfigSchema = new Schema<IGuildConfig>({
    _id: { type: Schema.Types.ObjectId, required: true },
    guildID: { type: String, required: true, unique: true },
    guildName: { type: String, required: true },
    channels: { type: [Object], default: [] },
    welcomeMessage: { type: [String], default: [] },
    deleteReaction: { type: String, default: "" },
});

export const GuildConfig = model<IGuildConfig>("GuildConfig", GuildConfigSchema, "db");