const humanizeDuration = require("humanize-duration");
const { MessageEmbed } = require("discord.js");
const { s, r, del } = require("../../functions");

module.exports = {
    name: "reminder",
    aliases: ["remindme", "remind", "timer"],
    category: "helpful",
    description: "Will remind you something after a given time, or it can be used as a timer.",
    permissions: "member",
    usage: "<time: HH:MM:SS 0-59:0-59:0-59>[reminder]",
    run: async (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide a time!");

        if (args[0].match(/^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/) == null)
            return r(message.channel, message.author, "Please provide a valid time: Ex: hh:mm:ss").then(m => del(m, 7500));
        else if (args[0] && !args[1]) {
            const timeSplit = args[0].split(":");
            const time = ((timeSplit[0] * 3600000) + (timeSplit[1] * 60000) + (timeSplit[2]) * 1000);

            const embed = new MessageEmbed()
                .setColor("#0efefe")
                .setTitle(`**Timer**`)
                .setDescription(`${message.author}, your timer is finished!`)
                .setFooter({ text: `Time elapsed: ${humanizeDuration(time)}`, iconURL: message.author.displayAvatarURL() });

            r(message.channel, message.author, `${humanizeDuration(time)} timer set`).then(m => del(m, 7500));

            return setTimeout(() => {
                s(message.channel, '', embed);
            }, time);
        } else if (args[1]) {
            const timeSplit = args[0].split(":");
            const time = ((timeSplit[0] * 3600000) + (timeSplit[1] * 60000) + (timeSplit[2]) * 1000);
            args.shift();
            const reminder = args.join(' ');

            if (reminder.length >= 1024)
                return r(message.channel, message.author, "Your reminder must be 1024 characters or less.").then(m => del(m, 7500));

            const embed = new MessageEmbed()
                .setColor("#0efefe")
                .setTitle(`**Reminder**`)
                .setDescription(`${message.author}, I am reminding you: ${reminder}!`)
                .setFooter({ text: `Time elapsed: ${humanizeDuration(time)}`, iconURL: message.author.displayAvatarURL() });

            r(message.channel, message.author, `You will be reminded in ${humanizeDuration(time)}.`).then(m => del(m, 7500));

            return setTimeout(() => {
                s(message.channel, '', embed);
            }, time);
        }
    }
}