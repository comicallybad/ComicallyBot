import { Client, Message } from "discord.js";
import { GuildConfig } from "../models/GuildConfig";
import CommandUsage from "../models/CommandUsage";
import PlayerState from "../models/PlayerState";
import { Types } from "mongoose";
import { Player } from "moonlink.js";

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

export async function setupGuilds(client: Client) {
    const guilds = client.guilds.cache.map(guild => ({ id: guild.id, name: guild.name }));

    await Promise.all(guilds.map(async guild => {
        await findOrCreateGuildConfig(guild.id, guild.name);
    }));
}

export async function addGuild(guildId: string, guildName: string) {
    await findOrCreateGuildConfig(guildId, guildName);
}

export async function removeGuild(guildId: string) {
    await GuildConfig.deleteOne({ guildID: guildId });
}

export async function incrementCommandUsage(commandName: string, guildId: string) {
    await CommandUsage.findOneAndUpdate(
        { commandName: commandName, guildId: guildId },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
    );
}

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

export async function getGuildCommandUsage(guildId: string) {
    const usage = await CommandUsage.find({ guildId: guildId }).sort({ count: -1 });
    return usage;
}

export async function getCommandUsageByCommandName(commandName: string) {
    const usage = await CommandUsage.find({ commandName: commandName }).sort({ count: -1 });
    return usage;
}

export async function resetCommandUsage(commandName: string) {
    await CommandUsage.updateMany({ commandName }, { $set: { count: 0 } });
}

export async function removeCommandUsage(commandName: string) {
    await CommandUsage.deleteMany({ commandName });
}

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

export async function savePlayerState(player: Player) {
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

export async function getSavedPlayerState(guildId: string) {
    return await PlayerState.findOne({ guildId: guildId });
}

export async function deletePlayerState(guildId: string) {
    await PlayerState.deleteOne({ guildId: guildId });
}

export async function getAllSavedPlayerStates() {
    return await PlayerState.find({});
}

