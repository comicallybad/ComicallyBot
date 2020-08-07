const { del } = require("../../functions");

module.exports = {
    name: "invites",
    aliases: ["invs"],
    category: "info",
    description: "Provides server invite links.",
    permissions: "member",
    run: async (client, message, args) => {
        const invites = await message.guild.fetchInvites().then(invites => invites.map(invite => `${invite} made by ${invite.inviter} with ${invite.uses} uses.`))
        message.channel.send(invites).then(m => del(m, 30000))
    }
}