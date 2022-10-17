const { s, r, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "vote",
    aliases: ["suggest", "idea"],
    category: "helpful",
    description: "Sends a message with a suggestion/idea users can vote on.",
    permissions: "member",
    usage: "<suggestion>",
    run: async (client, message, args) => {
        if (!message.channel.permissionsFor(message.guild.me).has("ADD_REACTIONS"))
            return r(message.channel, message.author, "I am missing permissions to `ADD_REACTIONS` in this channel for this command.").then(m => del(m, 30000));

        if (!args[0])
            return r(message.channel, message.author, "Please provide something to vote on!").then(m => del(m, 7500));

        let suggestion = args.join(" ");

        if (suggestion.length >= 1024)
            return r(message.channel, message.author, "You can only use a string less than 2048 characters!").then(m => del(m, 7500));

        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setAuthor({ name: `${message.member.user.tag}`, iconURL: message.author.displayAvatarURL() })
            .setDescription(`${suggestion}`)
            .setFooter({ text: `Select a reaction below to vote on` })
            .setTimestamp()

        if (args[0]) {
            let m = await s(message.channel, '', embed);
            return m.react("⬆️").then(m.react("⬇️"));
        }
    }
}