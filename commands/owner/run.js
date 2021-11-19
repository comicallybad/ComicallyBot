const { s, del } = require("../../functions.js");
const beautify = require("beautify");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "run",
    aliases: ["code", "try", "e"],
    category: "owner",
    description: "Attempts inputted code.",
    permissions: "admin",
    usage: "<code to evaluate>",
    run: (client, message, args) => {
        if (message.author.id != process.env.USERID)
            return message.reply("You're not the bot the owner!").then(m => del(m, 7500));

        if (!args[0])
            return message.reply("You need to provide code to evaluate").then(m => del(m, 7500));

        try {
            if (args.join(" ").toLowerCase().includes("token") || args.join(" ").toLowerCase().includes("fortnite")
                || args.join(" ").toLowerCase().includes("steam") || args.join(" ").toLowerCase().includes("erela"))
                return message.reply("You cannot find my token :)").then(m => del(m, 7500));

            const toEval = args.join(" ");
            const evaluated = eval(toEval);

            let embed = new MessageEmbed()
                .setColor("#00FF00")
                .setTimestamp()
                .setFooter(client.user.username, client.user.displayAvatarURL())
                .setTitle("Eval")
                .addField("Code to evaluate", `\`\`\`js\n${beautify(args.join(' '), { format: "js" })}\n\`\`\``)
                .addField("Evaluated: ", evaluated)
                .addField("Type of: ", typeof (evaluated))

            return s(message.channel, '', embed).then(m => del(m, 15000));
        } catch (err) {
            let embed = new MessageEmbed()
                .setColor("#FF0000")
                .setTitle("\:x: Error!")
                .setDescription(err)
                .setFooter(client.user.username, client.user.displayAvatarURL())

            return s(message.channel, '', embed).then(m => del(m, 15000));
        }
    }
}