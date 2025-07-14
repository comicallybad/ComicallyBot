import { Guild, Client } from "discord.js";
import { updateActivities } from "../../utils/activityUtils";
import { addGuild } from "../../utils/dbUtils";

export default {
    name: "guildCreate",
    execute(client: Client, guild: Guild) {
        updateActivities(client);
        addGuild(guild.id, guild.name);
    },
};