const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pause the current song."),
    execute: (client, interaction) => {
        const player = client.music.players.get(interaction.guild.id);

        if (!player || !player.queue.current)
            return interaction.reply({ content: "No song(s) currently playing in this guild.", ephemeral: true })
                .then(setTimeout(() => interaction.deleteReply().catch(err => err), 7500));

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel || voiceChannel.id !== player.voiceChannel)
            return interaction.reply({ content: "You need to be in the voice channel to pause music.", ephemeral: true })
                .then(setTimeout(() => interaction.deleteReply().catch(err => err), 7500));

        player.setTextChannel(interaction.channel.id);
        player.pause(true);

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Player Paused!`, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(player.queue.current.thumbnail)
            .setDescription(`⏸ The player has been paused! Use \`/play\` to resume playing. ▶️`);

        return interaction.reply({ embeds: [embed] })
            .then(setTimeout(() => interaction.deleteReply().catch(err => err), 15000));
    }
}
