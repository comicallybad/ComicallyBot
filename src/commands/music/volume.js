const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("volume")
        .setDescription("Changes the volume of the music player.")
        .addIntegerOption(option => option
            .setName("input")
            .setDescription("The volume percentage input.")
            .setRequired(true)),
    execute: (client, interaction) => {
        const volume = interaction.options.get("input").value;
        const player = client.music.players.get(interaction.guild.id);

        if (!player || !player.queue.current)
            return interaction.reply({ content: "No song(s) currently playing in this guild.", ephemeral: true })
                .then(setTimeout(() => interaction.deleteReply().catch(err => err), 7500));

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel || voiceChannel.id !== player.voiceChannel)
            return interaction.reply({ content: "You need to be in the voice channel to use this command.", ephemeral: true })
                .then(setTimeout(() => interaction.deleteReply().catch(err => err), 7500));

        if (volume <= 0 || volume > 100)
            return interaction.reply({ content: "You may only set the volume to 1-100.", ephemeral: true })
                .then(setTimeout(() => interaction.deleteReply().catch(err => err), 7500));

        player.setVolume(volume);

        const vol = volume / 10;
        const volFloor = Math.floor(volume / 10);
        const volLevel = vol > volFloor ? `${"🔊".repeat(volFloor)} 🔉 ${"🔈".repeat(10 - vol)}` : `${"🔊".repeat(volFloor)} ${"🔈".repeat(10 - vol)}`;

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Volume Changed!`, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(player.queue.current.thumbnail)
            .setDescription(`The volume has been set to: **${volume}%** ${volLevel}`);

        return interaction.reply({ embeds: [embed] })
            .then(setTimeout(() => interaction.deleteReply().catch(err => err), 15000));
    }
}