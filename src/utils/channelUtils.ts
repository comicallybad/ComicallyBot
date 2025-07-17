import { Guild, TextChannel, PermissionsBitField } from "discord.js";

export function getLogChannel(guild: Guild, channelNames: string[]): TextChannel | undefined {
    for (const name of channelNames) {
        const channel = guild.channels.cache.find(c => c.name.includes(name) && c.isTextBased()) as TextChannel | undefined;
        if (channel) {
            const perms = channel.permissionsFor(guild.members.me!)!;
            if (perms.has(PermissionsBitField.Flags.ViewChannel) && perms.has(PermissionsBitField.Flags.SendMessages)) {
                return channel;
            }
        }
    }
    return undefined;
}