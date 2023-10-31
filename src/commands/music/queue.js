const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Display the current song queue."),
    execute: (client, interaction) => {
        const player = client.music.players.get(interaction.guild.id);

        if (!player || !player.queue.current)
            return interaction.reply({ content: "No song(s) currently playing in this guild.", ephemeral: true })
                .then(setTimeout(() => interaction.deleteReply().catch(err => err), 7500));

        let index = 1;
        let string = "";

        if (player.queue.current)
            string += `__**Currently Playing**__\n ${player.queue.current.title} - **Requested by ${player.queue.current.requester.username}**. \n`;

        if (player.queue[0])
            string += `__**Rest of queue:**__\n ${player.queue.slice(0, 10).map(x => `**${index++})** ${x.title} - **Requested by ${x.requester.username}**.`).join("\n")}`;

        const embed = new EmbedBuilder()
            .setAuthor({ name: `🎧 Current Queue for ${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
            .setThumbnail(player.queue.current.thumbnail)
            .setDescription(string);

        return interaction.reply({ embeds: [embed] })
            .then(setTimeout(() => interaction.deleteReply().catch(err => err), 15000));
    }
}