import { Guild, TextChannel, PermissionsBitField } from "discord.js";

/**
 * Finds a suitable log channel in a guild based on a list of possible channel names.
 * @param guild The guild to search for the channel in.
 * @param channelNames An array of possible channel names to look for.
 * @returns The found TextChannel, or undefined if no suitable channel is found.
 */
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