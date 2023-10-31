const { s, del } = require("../../../utils/functions/functions.js");
const db = require("../../../utils/schemas/db.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "automoderationstatus",
    aliases: ["automodstatus"],
    category: "auto-moderation",
    description: "Toggles the anti-spam system on or off.",
    permissions: "moderator",
    usage: "<true/enable | false/disable>",
    run: (client, message, args) => {
        let guildID = message.guild.id;
        const embed = new EmbedBuilder()
            .setColor("#0efefe")
            .setTitle("Auto-Moderation Status")
            .setDescription("\`True\` === \`active\`, \`false\` ===  \`inactive\`.")
            .setTimestamp();

        return db.findOne({ guildID: guildID }, (err, exists) => {
            if (!exists) return;
            let antiSpam = exists.antiSpam;
            let profanityFilter = exists.profanityFilter;
            let xpSystem = exists.xpSystem;
            embed.addFields(
                { name: "Anti-Phisihng:", value: `\`${antiSpam}\`` },
                { name: "Anti-Spam:", value: `\`${profanityFilter}\`` },
                { name: "Profanity Filter:", value: `\`${profanityFilter}\`` },
                { name: "XP System: ", value: `\`${xpSystem}\`` });
            return s(message.channel, '', embed).then(m => del(m, 30000));
        }).catch(err => err);
    }
}