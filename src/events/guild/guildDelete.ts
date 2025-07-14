import { Guild, Client } from "discord.js";
import { updateActivities } from "../../utils/activityUtils";
import { removeGuild } from "../../utils/dbUtils";

export default {
    name: "guildDelete",
    execute(client: Client, guild: Guild) {
        updateActivities(client);
        removeGuild(guild.id);
    },
};