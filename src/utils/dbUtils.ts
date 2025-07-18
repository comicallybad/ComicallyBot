import { Client, Message } from "discord.js";
import { GuildConfig } from "../models/GuildConfig";
import CommandUsage from "../models/CommandUsage";
import PlayerState from "../models/PlayerState";
import { Types } from "mongoose";
import { Player } from "moonlink.js";

/**
 * Finds or creates a guild configuration in the database.
 * @param guildId The ID of the guild.
 * @param guildName The name of the guild.
 * @returns A Promise that resolves to the guild's configuration.
 */
async function findOrCreateGuildConfig(guildId: string, guildName: string) {
    let config = await GuildConfig.findOne({ guildID: guildId });
    if (!config) {
        config = new GuildConfig({
            _id: new Types.ObjectId(),
            guildID: guildId,
            guildName: guildName,
        });
    } else {
        config.guildName = guildName;
    }
    await config.save();
    return config;
}

/**
 * Sets up all guilds in the database that the client is currently in.
 * @param client The Discord client instance.
 */
export async function setupGuilds(client: Client): Promise<void> {
    const guilds = client.guilds.cache.map(guild => ({ id: guild.id, name: guild.name }));

    await Promise.all(guilds.map(async guild => {
        await findOrCreateGuildConfig(guild.id, guild.name);
    }));
}

/**
 * Adds a guild to the database.
 * @param guildId The ID of the guild to add.
 * @param guildName The name of the guild to add.
 */
export async function addGuild(guildId: string, guildName: string): Promise<void> {
    await findOrCreateGuildConfig(guildId, guildName);
}

/**
 * Removes a guild from the database.
 * @param guildId The ID of the guild to remove.
 */
export async function removeGuild(guildId: string): Promise<void> {
    await GuildConfig.deleteOne({ guildID: guildId });
}

/**
 * Increments the usage count of a command in a specific guild.
 * @param commandName The name of the command.
 * @param guildId The ID of the guild where the command was used.
 */
export async function incrementCommandUsage(commandName: string, guildId: string): Promise<void> {
    await CommandUsage.findOneAndUpdate(
        { commandName: commandName, guildId: guildId },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
    );
}

/**
 * Gets the global usage statistics for all commands.
 * @returns A Promise that resolves to an array of command usage statistics.
 */
export async function getGlobalCommandUsage() {
    const usage = await CommandUsage.aggregate([
        {
            $group: {
                _id: "$commandName",
                totalCount: { $sum: "$count" }
            }
        },
        {
            $sort: { totalCount: -1 }
        }
    ]);
    return usage;
}

/**
 * Gets the command usage statistics for a specific guild.
 * @param guildId The ID of the guild.
 * @returns A Promise that resolves to an array of command usage statistics for the guild.
 */
export async function getGuildCommandUsage(guildId: string) {
    const usage = await CommandUsage.find({ guildId: guildId }).sort({ count: -1 });
    return usage;
}

/**
 * Gets the usage statistics for a specific command.
 * @param commandName The name of the command.
 * @returns A Promise that resolves to an array of usage statistics for the command.
 */
export async function getCommandUsageByCommandName(commandName: string) {
    const usage = await CommandUsage.find({ commandName: commandName }).sort({ count: -1 });
    return usage;
}

/**
 * Resets the usage count for a specific command.
 * @param commandName The name of the command to reset.
 */
export async function resetCommandUsage(commandName: string): Promise<void> {
    await CommandUsage.updateMany({ commandName }, { $set: { count: 0 } });
}

/**
 * Removes all usage data for a specific command.
 * @param commandName The name of the command to remove usage data for.
 */
export async function removeCommandUsage(commandName: string): Promise<void> {
    await CommandUsage.deleteMany({ commandName });
}

/**
 * Gets the total command usage for each guild, sorted by the specified order.
 * @param sortOrder The order to sort the results by (1 for ascending, -1 for descending).
 * @returns A Promise that resolves to an array of guild usage statistics.
 */
export async function getGuildUsage(sortOrder: 1 | -1) {
    return CommandUsage.aggregate([
        {
            $group: {
                _id: "$guildId",
                totalCount: { $sum: "$count" },
            },
        },
        {
            $sort: { totalCount: sortOrder },
        },
    ]);
}

/**
 * Saves the state of a music player to the database.
 * @param player The music player instance.
 */
export async function savePlayerState(player: Player): Promise<void> {
    if (!player) return;
    await PlayerState.findOneAndUpdate(
        { guildId: player.guildId },
        {
            guildId: player.guildId,
            voiceChannelId: player.voiceChannelId,
            textChannelId: player.textChannelId,
            messageId: (player.data.message as Message)?.id,
            queue: player.queue.tracks,
            previous: player.previous,
            currentTrack: player.current,
            position: player.current?.position ?? 0,
            playing: player.playing,
            paused: player.paused,
            volume: player.volume,
            loop: player.loop,
            autoPlay: player.autoPlay,
        },
        { upsert: true, new: true }
    );
}

/**
 * Gets the saved state of a music player for a specific guild.
 * @param guildId The ID of the guild.
 * @returns A Promise that resolves to the saved player state, or null if not found.
 */
export async function getSavedPlayerState(guildId: string) {
    return await PlayerState.findOne({ guildId: guildId });
}

/**
 * Deletes the saved state of a music player for a specific guild.
 * @param guildId The ID of the guild.
 */
export async function deletePlayerState(guildId: string): Promise<void> {
    await PlayerState.deleteOne({ guildId: guildId });
}

/**
 * Gets all saved player states from the database.
 * @returns A Promise that resolves to an array of all saved player states.
 */
export async function getAllSavedPlayerStates() {
    return await PlayerState.find({});
}

