const { s, r, del } = require("../../functions.js");
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const db = require("../../schemas/db.js");

module.exports = {
    name: "setdeletereaction",
    aliases: ["setdelreaction"],
    category: "moderation",
    description: "Sets an emoji to which, when added as a reaction, will delete the message.",
    permissions: "moderator",
    usage: "<emoji | emojiID>",
    run: async (client, message, args) => {
        if (!message.guild.me.permissions.has("MANAGE_MESSAGES"))
            return r(message.channel, message.author, "I am missing permissions to `MANAGE_MESSAGES`!").then(m => del(m, 7500));

        if (!message.guild.me.permissions.has("ADD_REACTIONS"))
            return r(message.channel, message.author, "I am missing permissions to `ADD_REACTIONS` to validate the provided emoji.").then(m => del(m, 30000));

        let reaction = args[0].includes("<:")
            ? args[0].replace("<:", "").slice(args[0].replace("<:", "").indexOf(":") + 1, args[0].replace("<:", "").length - 1)
            : args[0].includes("<a:")
                ? args[0].replace("<a:", "").slice(args[0].replace("<a:", "").indexOf(":") + 1, args[0].replace("<a:", "").length - 1)
                : args[0];

        let validate = await s(message.channel, "Validating Reaction Emoji");

        return validate.react(reaction).then(() => {
            del(validate, 0)
            s(message.channel, "Delete reaction emoji has been verified and set.").then(m => del(m, 7500));

            db.updateOne({ guildID: message.guild.id }, {
                $set: { deleteReaction: reaction }
            }).catch(err => err);

            const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
            const embed = new MessageEmbed()
                .setTitle("Delete Reaction Set")
                .setColor("#0efefe")
                .setThumbnail(message.member.user.displayAvatarURL())
                .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                .setTimestamp()
                .setDescription(stripIndents`
                **Delete Reaction Set To:** ${reaction.length <= 17 ? reaction : message.guild.emojis.cache.get(reaction)} 
                **Delete Reaction Set By:** ${message.member}`);

            return s(logChannel, '', embed);
        }).catch(err => {
            return r(message.channel, message.author, `The provided reaction emoji could not be used: ${err}`)
        });
    }
}