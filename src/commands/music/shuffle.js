const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("Shuffles the current song queue."),
    execute: (client, interaction) => {
        const player = client.music.players.get(interaction.guild.id);

        if (!player || !player.queue.current)
            return interaction.reply({ content: "No song(s) currently playing in this guild.", ephemeral: true })
                .then(setTimeout(() => interaction.deleteReply().catch(err => err), 7500));

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel || voiceChannel.id !== player.voiceChannel)
            return interaction.reply({ content: "You need to be in the voice channel to use this command.", ephemeral: true })
                .then(setTimeout(() => interaction.deleteReply().catch(err => err), 7500));

        player.setTextChannel(interaction.channel.id);
        player.queue.shuffle();

        const embed = new EmbedBuilder()
            .setAuthor({ name: "Queue Shuffled!", iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(player.queue.current.thumbnail)
            .setDescription("🔀 The song queue has been shuffled randomly!");

        return interaction.reply({ embeds: [embed] })
            .then(setTimeout(() => interaction.deleteReply().catch(err => err), 15000));
    }
}