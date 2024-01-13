const { s, del } = require("../../../utils/functions/functions.js");
const beautify = require("beautify");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "run",
    aliases: ["e", "eval"],
    category: "owner",
    description: "Attempts inputted code.",
    permissions: "admin",
    usage: "<code to evaluate>",
    run: (client, message, args) => {
        if (message.author.id != process.env.USERID)
            return s(message.channel, "You're not the bot the owner!").then(m => del(m, 7500));

        if (!args[0])
            return s(message.channel, "You need to provide code to evaluate").then(m => del(m, 7500));

        try {
            if (args.join(" ").toLowerCase().includes("token") || args.join(" ").toLowerCase().includes("music") || args.join(" ").toLowerCase().includes("openai"))
                return s(message.channel, "You cannot find my token :)").then(m => del(m, 7500));

            const toEval = args.join(" ");
            const evaluated = eval(toEval);

            let embed = new EmbedBuilder()
                .setColor("#00FF00")
                .setTimestamp()
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setTitle("Eval")
                .addFields(
                    { name: "Code to evaluate", value: `\`\`\`js\n${beautify(toEval, { format: "js" }).length < 1014 ? beautify(toEval, { format: "js" }) : beautify(toEval, { format: "js" }).substring(0, 1004) + "..."}\n\`\`\`` },
                    { name: "Evaluated: ", value: `${evaluated}` },
                    { name: "Type of: ", value: `${typeof (evaluated)}` });

            return s(message.channel, '', embed).then(m => del(m, 15000));
        } catch (err) {
            let embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("\:x: Error!")
                .setDescription(`${err}`)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })

            return s(message.channel, '', embed).then(m => del(m, 15000));
        }
    }
}