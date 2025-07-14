import { Guild, TextChannel } from "discord.js";

export function getLogChannel(guild: Guild, channelNames: string[]): TextChannel | undefined {
    for (const name of channelNames) {
        const channel = guild.channels.cache.find(c => c.name.includes(name) && c.isTextBased()) as TextChannel | undefined;
        if (channel) {
            return channel;
        }
    }
    return undefined;
}