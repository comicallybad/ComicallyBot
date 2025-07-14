import { Schema, model } from "mongoose";

interface ICommandUsage {
    commandName: string;
    guildId: string;
    count: number;
}

const commandUsageSchema = new Schema<ICommandUsage>({
    commandName: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        required: true,
        default: 0,
    },
});

commandUsageSchema.index({ commandName: 1, guildId: 1 }, { unique: true });

const CommandUsage = model<ICommandUsage>("CommandUsage", commandUsageSchema);

export default CommandUsage;