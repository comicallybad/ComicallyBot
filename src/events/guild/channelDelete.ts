import { Channel, Client } from "discord.js";
import { GuildConfig } from "../../models/GuildConfig";

export default {
    name: "channelDelete",
    async execute(client: Client, channel: Channel) {
        if (!('guild' in channel)) return;

        const channelID = channel.id;
        const guildID = channel.guild.id;

        try {
            await GuildConfig.updateOne({ guildID: guildID }, {
                $pull: { channels: { channelID: channelID } }
            });
        } catch (error) {
            return;
        }
    },
};