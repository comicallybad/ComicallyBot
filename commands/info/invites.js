const { s, r, del } = require("../../functions");

module.exports = {
    name: "invites",
    aliases: ["invs"],
    category: "info",
    description: "Provides server invite links.",
    permissions: "member",
    run: async (client, message, args) => {
        if (!message.guild.me.permissions.has("MANAGE_GUILD"))
            return s(message.channel, `There was an error fetching invites. I need MANAGE_SERVER permissions for this command.`).then(m => del(m, 7500));

        const amount = await message.guild.fetchInvites().then(invites => invites.size).catch(err => { return -1 });

        if (amount == -1) return s(message.channel, `There was an error fetching invites...`).then(m => del(m, 7500));

        if (amount > 0) {
            const invites = await message.guild.fetchInvites().then(invites => invites.sort((x, y) => { return y.uses - x.uses }).map(invite => {
                if (invite.inviter) return `**${invite.code}** made by **${invite.inviter.username}** with **${invite.uses}** uses.`
            }));
            return s(message.channel, invites).then(m => del(m, 30000));
        } else {
            return r(message.channel, message.author, "There are no server invites created.").then(m => del(m, 30000))
        }
    }
}