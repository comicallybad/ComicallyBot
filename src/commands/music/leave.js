const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leave")
        .setDescription("Disconnects the bot from the voice channel."),
    execute: (client, interaction) => {
        const player = client.music.players.get(interaction.guild.id);

        if (!player)
            return interaction.reply({ content: "No song(s) currently playing in this guild.", ephemeral: true })
                .then(setTimeout(() => interaction.deleteReply().catch(err => err), 7500));

        player.destroy();

        const embed = new EmbedBuilder()
            .setAuthor({ name: "Music Player Disconnected!", iconURL: interaction.user.displayAvatarURL() })
            .setDescription("🛑 The music player has successfully been disconnected!");

        return interaction.reply({ embeds: [embed] })
            .then(setTimeout(() => interaction.deleteReply().catch(err => err), 15000));
    },
};
