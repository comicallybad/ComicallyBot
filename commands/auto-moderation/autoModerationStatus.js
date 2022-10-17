const { s, del } = require("../../functions");
const db = require("../../schemas/db.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "automoderationstatus",
    aliases: ["automodstatus"],
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

        return db.findOne({ guildID: guildID }, (err, exists) => {
            if (!exists) return;
            let antiSpam = exists.antiSpam;
            let profanityFilter = exists.profanityFilter;
            let xpSystem = exists.xpSystem;
            embed.addField("Anti-Phisihng:", `\`${antiSpam}\``)
                .addField("Anti-Spam:", `\`${profanityFilter}\``)
                .addField("Profanity Filter:", `\`${profanityFilter}\``)
                .addField("XP System: ", `\`${xpSystem}\``);
            return s(message.channel, '', embed).then(m => del(m, 30000));
        }).catch(err => err);
    }
}