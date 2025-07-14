import { Client } from "discord.js";
import { GuildConfig } from "../models/GuildConfig";
import { Types } from "mongoose";

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