const beautify = require("beautify");

const { RichEmbed } = require("discord.js");

module.exports = {
    name: "eval",
    aliases: ["code", "try", "evaluate", "e"],
    category: "administration",
    description: "Attempts inputted code.",
    permissions: "admin",
    usage: "<code to evaluate>",
    run: (client, message, args) => {
        if (message.deletable) message.delete();

        if (!args[0])
            return message.reply("You need to provide code to evaluate").then(m => m.delete(7500));

        try {
            if (args.join(" ").toLowerCase().includes("tokjen"))
                return message.reply("You cannot find my token :)").then(m => m.delete(7500));

            const toEval = args.join(" ");
            const evaluated = eval(toEval);

            let embed = new RichEmbed()
                .setColor("#00FF00")
                .setTimestamp()
                .setFooter(client.user.username, client.user.displayAvatarURL)
                .setTitle("Eval")
                .addField("Code to evaluate", `\`\`\`js\n${beautify(args.join(" "), { format: "js" })}\n\`\`\``)
                .addField("Evaluated: ", evaluated)
                .addField("Type of: ", typeof (evaluated))

            message.channel.send(embed)
        } catch (err) {
            let embed = new RichEmbed()
                .setColor("#FF0000")
                .setTitle("\:x: Error!")
                .setDescription(err)
                .setFooter(client.user.username, client.user.displayAvatarURL)

            message.channel.send(embed)
        }
    }
}