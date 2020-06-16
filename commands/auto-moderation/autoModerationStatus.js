const { del } = require("../../functions");
const db = require("../../schemas/db.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "automoderationstatus",
    aliases: ["statusautomod", "statusautomoderation", "automodstatus"],
    category: "auto-moderation",
    description: "Toggles the anti-spam system on or off.",
    permissions: "moderator",
    usage: "<true/enable | false/disable>",
    run: (client, message, args) => {
        let guildID = message.guild.id;
        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Auto-Moderation Status")
            .setDescription("\`True\` === \`active\`, \`false\` ===  \`inactive\`.")
            .setTimestamp();

        db.findOne({ guildID: guildID }, (err, exists) => {
            let antiSpam = exists.antiSpam;
            let profanityFilter = exists.profanityFilter;
            let xpSystem = exists.xpSystem;
            embed.addField("Anti-Spam System:", `\`${antiSpam}\``)
            embed.addField("Profanity Filter:", `\`${profanityFilter}\``)
            embed.addField("XP System: ", `\`${xpSystem}\``)
            message.channel.send(embed).then(m => del(m, 30000))
        }).catch(err => err)
    }
}