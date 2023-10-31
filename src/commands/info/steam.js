const { s, r, del, formatDate } = require("../../../utils/functions/functions.js");
const { EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "steam",
    category: "info",
    description: "Get steam information of a user.",
    permissions: "member",
    usage: "<user>",
    run: async (client, message, args) => {
        const token = process.env.STEAM;
        if (!args[0]) return r(message.channel, message.author, "Please provide an account name!").then(m => del(m, 7500));
        const url = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${token}&vanityurl=${args.join(" ")}`;

        fetch(url).then(res => res.json()).then(body => {
            if (body.response.success === 42) return r(message.channel, message.author, "I was unable to find a steam profile with that name").then(m => del(m, 7500));

            const id = body.response.steamid;
            const summaries = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${token}&steamids=${id}`;
            const bans = `http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${token}&steamids=${id}`;
            const state = ["Offline", "Online", "Busy", "Away", "Snooze", "Looking to trade", "Looking to play"];

            return fetch(summaries).then(res => res.json()).then(body => {
                if (!body.response) return s(message.channel, "I was unable to find a steam profile with that name").then(m => del(m, 7500));
                const { personaname, avatarfull, realname, personastate, loccountrycode, profileurl, timecreated } = body.response.players[0];
                fetch(bans).then(res => res.json()).then(body => {
                    if (!body.players) return s(message.channel, "I was unable to find a steam profile with that name").then(m => del(m, 7500));
                    const { NumberOfVACBans, NumberOfGameBans } = body.players[0];
                    const createdAt = new Date(timecreated * 1000).toLocaleDateString('en-US');

                    const embed = new EmbedBuilder()
                        .setColor("#0efefe")
                        .setAuthor({ name: `Steam Services | ${personaname}`, iconURL: avatarfull })
                        .setThumbnail(avatarfull)
                        .setDescription(stripIndents`**Real Name:** ${realname || "Unknown"}
                        **Status:** ${state[personastate]}
                        **Country:** :flag_${loccountrycode ? loccountrycode.toLowerCase() : "white"}:
                        **Account Created:** ${createdAt}
                        **Bans:** Vac: ${NumberOfVACBans}, Game: ${NumberOfGameBans}
                        **Link:** [link to profile](${profileurl})`)
                        .setTimestamp();

                    return s(message.channel, '', embed).then(m => del(m, 30000));
                }).catch(err => err);
            }).catch(err => err);
        }).catch(err => err);
    }
}