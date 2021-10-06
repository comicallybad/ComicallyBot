const algebra = require("algebra.js");
const { MessageEmbed } = require("discord.js");
const { del, promptMessage } = require("../../functions.js");

module.exports = {
    name: "solveexpression",
    aliases: ["solve", "mathsolve"],
    category: "math",
    description: "Solves a math expression.",
    permissions: "member",
    usage: "<math expression to be simplified> ex: 2* 5 will result in 10.",
    run: (client, message, args) => {
        try {
            let expression = args.join('').replace(/([a-zA-Z])/g, 'x');

            let embed = new MessageEmbed()
                .setTitle("Solving Expression")
                .setColor("#0efefe")
                .addField(`Original expression:`, `\`${expression}\``)
                .addField("Solved expression: ", algebra.parse(expression).solveFor("x").toString().length > 0 ? `\`${algebra.parse(expression).solveFor("x").toString()}\`` : `\`Could not solve. Possible imaginary solutions.\``)
                .setFooter("React ❤️ to save or 🗑️ to delete.\n No reaction will then delete after 30s", message.author.displayAvatarURL())

            message.channel.send(embed).then(async m => {
                let reacted = await promptMessage(m, message.author, 30, ["❤️", "🗑️"]);
                if (reacted == "❤️") m.reactions.removeAll();
                else if (reacted == "🗑️") del(m, 0);
                else if (!reacted) del(m, 0);
            });
        } catch {
            message.reply('You must have provided invalid syntax, or this expression cannot be solved.').then(m => del(m, 7500));
        }
    }
}