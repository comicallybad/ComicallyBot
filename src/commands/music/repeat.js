const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("repeat")
        .setDescription("Repeats the current track or entire song queue.")
        .addSubcommand(command => command
            .setName("track")
            .setDescription("Repeat current track."))
        .addSubcommand(command => command
            .setName("queue")
            .setDescription("Repeat entire queue.")),
    execute: (client, interaction) => {
        const subcommand = interaction.options.getSubcommand();
        const player = client.music.players.get(interaction.guild.id);

        if (!player || !player.queue.current)
            return interaction.reply({ content: "No song(s) currently playing in this guild.", ephemeral: true })
                .then(setTimeout(() => interaction.deleteReply().catch(err => err), 7500));

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel || voiceChannel.id !== player.voiceChannel)
            return interaction.reply({ content: "You need to be in the voice channel to use this command.", ephemeral: true })
                .then(setTimeout(() => interaction.deleteReply().catch(err => err), 7500));

        player.setTextChannel(interaction.channel.id);

        if (subcommand === "track") {
            if (player.trackRepeat) player.setTrackRepeat(false);
            else player.setTrackRepeat(true);

            const embed = new EmbedBuilder()
                .setAuthor({ name: `Track Repeat: ${player.trackRepeat ? "ON" : "OFF"}!`, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail(player.queue.current.thumbnail)
                .setDescription(`Track repeat has been toggled ${player.trackRepeat ? "**ON** - (the current track will now loop) 🔁" : "**OFF** - (the current track will no longer loop) ❌🔁"}.`);

            return interaction.reply({ embeds: [embed] })
                .then(setTimeout(() => interaction.deleteReply().catch(err => err), 15000));
        } else if (subcommand === "queue") {
            if (player.queueRepeat) player.setQueueRepeat(false);
            else player.setQueueRepeat(true);

            const embed = new EmbedBuilder()
                .setAuthor({ name: `Queue Repeat: ${player.queueRepeat ? "ON" : "OFF"}!`, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail(player.queue.current.thumbnail)
                .setDescription(`The player queue repeat has been toggled ${player.queueRepeat ? "**ON** - (the queue will now loop) 🔁" : "**OFF** - (the queue will no longer loop) ❌🔁"}.`);

            return interaction.reply({ embeds: [embed] })
                .then(setTimeout(() => interaction.deleteReply().catch(err => err), 15000));
        }
    }
}