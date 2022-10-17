const db = require("../../schemas/db.js");
const { s, r, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "setwelcomereactions",
    aliases: ["setwelcomereaction"],
    category: "welcoming",
    description: "Adds a reaction or multiple reactions to the welcome message sent when a user joins.",
    permissions: "moderator",
    useage: "<emoji(s)>",
    run: async (client, message, args) => {
        if (!message.channel.permissionsFor(message.guild.me).has("ADD_REACTIONS"))
            return r(message.channel, message.author, "I am missing permissions to `ADD_REACTIONS` in this channel for this command.").then(m => del(m, 30000));

        if (!args[0])
            return r(message.channel, message.author, "Please input at least one reaction emoji.").then(m => del(m, 7500));

        if (args.length > 10)
            return r(message.channel, message.author, "A maximum of 10 reactions is allowed.").then(m => del(m, 7500));

        let guildID = message.guild.id;
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        let charEmojis = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹', '🇺', '🇻', '🇼', '🇽', '🇾', '🇿']

        let emojis = args.map(emoji => {
            if (emoji.includes("<:"))
                return customEmoji = emoji.replace("<:", "").slice(emoji.replace("<:", "").indexOf(":") + 1, emoji.replace("<:", "").length - 1);
            else if (/\p{Extended_Pictographic}/u.test(`${emoji}`)) return emoji;
            else if (charEmojis.includes(emoji)) return emoji;
            else return null;
        });

        if (emojis.length === 0 || emojis.includes(null))
            return r(message.channel, message.author, "You included an invalid emoji.").then(m => del(m, 7500));

        db.findOne({ guildID: guildID }, (err, exists) => {
            if (exists) exists.welcomeMessageReactions = args;
            exists.save().catch(err => err);
        }).catch(err => err);

        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Welcome Message Reaction(s) Changed")
            .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
            .setDescription(stripIndents`
            **Welcome message reaction(s) changed To:** ${args.join(' ')}
            **Welcome message reaction(s) changed By:** ${message.author}`);

        s(logChannel, '', embed);

        return r(message.channel, message.author, `Welcome message reaction(s) have been set to: ${args.join(' ')}`).then(m => del(m, 7500));
    }
}
