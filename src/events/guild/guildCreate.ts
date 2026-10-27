import { Guild, Client } from "discord.js";
import { updateActivities } from "../../utils/activityUtils";
import { addGuild } from "../../utils/dbUtils";
import { formatLogTimestamp } from "../../utils/logUtils";

export default {
    name: "guildCreate",
    async execute(client: Client, guild: Guild) {
        updateActivities(client);
        addGuild(guild.id, guild.name);

        await guild.members.fetch().catch((error: unknown) => {
            console.error(`${formatLogTimestamp()} [ERROR] Failed to fetch members on guild join for ${guild.name} (${guild.id}): ${(error as Error).message}`);
        });
    },
};