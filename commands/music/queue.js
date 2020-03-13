const { del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js")

module.exports = {
    name: "queue",
    aliases: ["q"],
    category: "music",
    description: "Displays what the current queue is.",
    permissions: "member",
    run: (client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if (!player || !player.queue[0])
            return message.reply("No song currently playing in this guild.").then(m => del(m, 7500));

        let index = 1;
        let string = "";

        if (player.queue[0]) string += `__**Currently Playing**__\n ${player.queue[0].title} - **Requested by ${player.queue[0].requester.username}**. \n`;
        if (player.queue[1]) string += `__**Rest of queue:**__\n ${player.queue.slice(1, 11).map(x => `**${index++})** ${x.title} - **Requested by ${x.requester.username}**.`).join("\n")}`;

        const embed = new MessageEmbed()
            .setAuthor(`Current Queue for ${message.guild.name}`, message.guild.iconURL)
            .setThumbnail(player.queue[0].thumbnail)
            .setDescription(string);

        return message.channel.send(embed).then(m => del(m, 30000));
    }
}