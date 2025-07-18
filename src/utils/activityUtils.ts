import { ActivityType, Client } from "discord.js";

/**
 * Updates the bot's activity list with current server and user counts.
 * @param client The Discord client instance.
 */
export function updateActivities(client: Client): void {
    if (!client.user) return;

    client.activities = [
        `${client.guilds.cache.size} servers!`,
        `${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} users!`
    ];
}

/**
 * Initializes the bot's rotating activities and sets an interval to update them.
 * @param client The Discord client instance.
 */
export function initializeActivities(client: Client): void {
    updateActivities(client);

    let i = 0;
    setInterval(() => {
        if (client.user) {
            client.user.setActivity({
                name: `${client.activities[i++ % client.activities.length]}`, 
                type: ActivityType.Watching
            });
        }
    }, 7500);
}