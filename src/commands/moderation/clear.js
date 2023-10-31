const { r, del } = require("../../../utils/functions/functions.js");

module.exports = {
    name: "clear",
    aliases: ["purge"],
    category: "moderation",
    description: "Clears the chat.",
    permissions: "moderator",
    usage: "[@user | userID]<number of messages>",
    run: async (client, message, args) => {
        if (!message.channel.permissionsFor(message.guild.me).has("MANAGE_MESSAGES"))
            return r(message.channel, message.author, "I do not have permissions to delete messages.").then(m => del(m, 7500));

        if (!args[1]) {
            if (isNaN(args[0]) || parseInt(args[0]) <= 0)
                return r(message.channel, message.author, "Please provide a valid number.").then(m => del(m, 7500));

            let deleteAmount = parseInt(args[1]) > 100 ? 100 : args[0];

            message.channel.messages.fetch({ limit: 100 }).then((messages) => {
                messages = messages.filter(m => m.id !== message.id).map(x => x).slice(0, (deleteAmount));
                message.channel.bulkDelete(messages).catch(err => {
                    return r(message.channel, message.author, `There was an error attempting to delete that amount of messages: ${err}`).then(m => del(m, 7500));
                });
            });
        } else if (args[1]) {
            if (isNaN(args[1]) || parseInt(args[1]) <= 0)
                return r(message.channel, message.author, "Please provide a valid number.").then(m => del(m, 7500));

            let deleteAmount = parseInt(args[1]) > 100 ? 100 : args[1];

            if (message.mentions.users.first()) {
                return message.channel.messages.fetch({ limit: 100 }).then((messages) => {
                    const filterBy = message.mentions.users.first().id;
                    messages = messages.filter(m => m.author.id === filterBy && m.id !== message.id).map(x => x).slice(0, (deleteAmount));
                    message.channel.bulkDelete(messages).catch(err => {
                        return r(message.channel, message.author, `There was an error attempting to delete that member's messages: ${err}`).then(m => del(m, 7500));
                    });
                });
            } else if (parseInt(args[0]) > 1000000) {
                let deleteAmount = parseInt(args[1]) > 100 ? 100 : args[1];
                let member = await message.guild.members.fetch(args[0]).catch(() => { return undefined });
                if (!member) member = { id: args[0] };
                if (member) {
                    message.channel.messages.fetch({ limit: 100 }).then((messages) => {
                        const filterBy = member.id;
                        messages = messages.filter(m => m.author.id === filterBy && m.id !== message.id).map(x => x).slice(0, (deleteAmount));
                        message.channel.bulkDelete(messages).catch(err => {
                            return r(message.channel, message.author, `There was an error attempting to delete that member's messages: ${err}`).then(m => del(m, 7500));
                        });
                    });
                } else return r(message.channel, message.author, "Sorry, I could not find that member.").then(m => del(m, 7500));
            }
        }
    }
}