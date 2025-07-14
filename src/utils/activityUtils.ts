import { ActivityType, Client } from "discord.js";

export function updateActivities(client: Client) {
    if (!client.user) return;

    client.activities = [
        `${client.guilds.cache.size} servers!`,
        `${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} users!`
    ];
}

export function initializeActivities(client: Client) {
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