const { s, r, del, promptMessage } = require("../../functions.js");
const { simplify } = require("mathjs");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "simplifyexpression",
    aliases: ["simplify"],
    category: "math",
    description: "Simplifies a math expression.",
    permissions: "member",
    usage: "<math expression to be simplified> ex: 2* 5 will result in 10.",
    run: (client, message, args) => {
        try {
            let expression = args[0]
            if (args[1]) expression = args.join('');
            let embed = new MessageEmbed()
                .setTitle("Simpliying Expression")
                .setColor("#0efefe")
                .addField(`Original expression:`, `\`${expression}\``)
                .addField("Simplified expression: ", `\`${simplify(expression).toString()}\``)
                .setFooter("React ❤️ to save or 🗑️ to delete.\n No reaction will then delete after 30s", message.author.displayAvatarURL())

            s(message.channel, '', embed).then(async m => {
                let reacted = await promptMessage(m, message.author, 30, ["❤️", "🗑️"]);
                if (reacted == "❤️") m.reactions.removeAll();
                else if (reacted == "🗑️") del(m, 0);
                else if (!reacted) del(m, 0);
            });
        } catch {
            return r(message.channel, message.author, "You must have provided invalid syntax.").then(m => del(m, 7500));
        }
    }
}