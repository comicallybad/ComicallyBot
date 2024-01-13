const { s, del } = require("../../../utils/functions/functions.js");;

module.exports = {
    name: "kickinactive",
    aliases: ["kickunverified"],
    category: "owner",
    description: "Cleans DM messages from bot to Owner.",
    permissions: "owner",
    run: async (client, message, args) => {
        if (message.author.id != process.env.USERID)
            return s(message.channel, "You're not the bot the owner!").then(m => del(m, 7500));

        let list = await message.guild.members.fetch();
        let members = await list.filter(member => member._roles.length == 0);

        members.forEach(member => {
            message.guild.members.kick(member, "Not Authenticating")
        });

        return s(message.channel, "Unverified users have been kicked.").then(m => del(m, 7500));
    }
}