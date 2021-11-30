const { s, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const fetch = require("node-fetch");

module.exports = {
    name: "instagram",
    aliases: ["insta", "ig"],
    category: "info",
    description: "Find out some nice instagram statistics.",
    permissions: "member",
    usage: "<name>",
    run: async (client, message, args) => {
        const name = args.join(" ");

        if (!name) {
            return r(message.channel, message.author, "Maybe it's useful to actually search for someone...!").then(m => del(m, 7500));
        }

        const url = `https://instagram.com/${name}/?__a=1`;

        let res;

        try {
            res = await fetch(url).then(url => url.json());
        } catch (e) {
            return r(message.channel, message.author, "I couldn't find that account...").then(m => del(m, 7500));
        }

        let account;

        if (res.graphql) account = res.graphql.user;
        else return r(message.channel, message.author, "Sorry there was an error finding that account.").then(m => del(m, 7500));

        const info = stripIndents`**- Username:** ${account.username}
        **- Full name:** ${account.full_name}
        **- Biography:** ${account.biography.length == 0 ? "none" : account.biography}
        **- Posts:** ${account.edge_owner_to_timeline_media.count}
        **- Followers:** ${account.edge_followed_by.count}
        **- Following:** ${account.edge_follow.count}
        **- Private account:** ${account.is_private ? "Yes 🔐" : "Nope 🔓"}`

        if (info >= 1024)
            return r(message.channel, message.author, "Sorry, this profile must have a bio too large to fit inside of a message embed.").then(m => del(m, 7500));
        else {
            const embed = new MessageEmbed()
                .setColor("#0efefe")
                .setTitle(account.full_name)
                .setURL(`https://instagram.com/${name}`)
                .setThumbnail(account.profile_pic_url_hd)
                .addField("Profile information", info);

            return s(message.channel, '', embed).then(m => del(m, 15000));
        }
    }
}