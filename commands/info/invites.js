const { del } = require("../../functions");

module.exports = {
    name: "invites",
    aliases: ["invs"],
    category: "info",
    description: "Provides server invite links.",
    permissions: "member",
    run: async (client, message, args) => {
        const amount = await message.guild.fetchInvites().then(invites => invites.size);

        if (amount > 0) {
            const invites = await message.guild.fetchInvites().then(invites => invites.map(invite => `${invite} made by ${invite.inviter} with ${invite.uses} uses.`))
            return message.channel.send(invites).then(m => del(m, 30000))
        } else {
            return message.reply("There are no server invites created.").then(m => del(m, 30000))
        }
    }
}