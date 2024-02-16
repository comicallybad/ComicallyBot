const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { r, re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Manage the current song queue.")
        .addSubcommand(subcommand => subcommand.setName('view').setDescription('Display the current song queue.'))
        .addSubcommand(subcommand => subcommand.setName('clear').setDescription('Clear the current song queue.'))
        .addSubcommand(subcommand => subcommand.setName('remove').setDescription('Removes a song or group of song from the song queue.')
            .addIntegerOption(option => option.setName('index').setDescription('The index of the song to remove from the queue.').setRequired(true).setAutocomplete(true))
            .addIntegerOption(option => option.setName('end').setDescription('The index of which songs will be removed up to.').setAutocomplete(true)))
        .addSubcommand(subcommand => subcommand.setName('swap').setDescription('Swap two songs in the queue.')
            .addIntegerOption(option => option.setName('index-1').setDescription('The index of the first song to swap.').setRequired(true).setAutocomplete(true))
            .addIntegerOption(option => option.setName('index-2').setDescription('The index of the second song to swap.').setRequired(true).setAutocomplete(true))),
    autocomplete: async (interaction, client) => {
        const player = client.music.players.get(interaction.guild.id);
        if (!player || !player.queue.current) return;
        const focusedValue = interaction.options.getFocused();
        let choices = player.queue.map((x, i) => ({
            name: `${i + 1}) ${x.title}`.substring(0, 100),
            value: i + 1
        }));

        if (focusedValue) choices = choices.filter(choice => choice.name.toLowerCase().includes(focusedValue.toLowerCase()));

        if (choices.length > 25) {
            const lastChoice = choices[choices.length - 1];
            choices = choices.slice(0, 24);
            choices.push(lastChoice);
        }

        return await interaction.respond(choices).catch(err => err);
    },
    execute: (interaction, client) => {
        const subcommand = interaction.options.getSubcommand();
        const player = client.music.players.get(interaction.guild.id);

        if (!player || !player.queue.current)
            return re(interaction, "No song(s) currently playing in this guild.").then(() => delr(interaction, 7500));

        switch (subcommand) {
            case 'view':
                return viewQueue(interaction, player);
            case 'clear':
                return clearQueue(interaction, player);
            case 'remove':
                return removeQueue(interaction, player);
            case 'swap':
                return swapQueue(interaction, player);
        }
    }
}

function viewQueue(interaction, player) {
    let index = 1;
    let string = "";
    const track = player.queue.current || undefined;

    if (track)
        string += `__**Currently Playing:**__
        [${track.title.includes(track.author) ? track.title : `${track.title} by ${track.author}`}](${track.uri}) - **Requester:** ${track.requester.username}. \n`;

    if (player.queue[0])
        string += `__**Rest of queue:**__\n ${player.queue.slice(0, 10).map(x =>
            `**${index++})** [${x.title.includes(x.author) ? x.title : `${x.title} by ${x.author}`}](${x.uri}) - **Requester:** ${x.requester.username}.`).join("\n")}`;

    if (player.queue.size > 10)
        string += `\n\n**...${player.queue.size - 10} more song(s)**`;

    const embed = new EmbedBuilder()
        .setAuthor({ name: `🎧 Current Queue for ${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
        .setThumbnail(track.thumbnail ? track.thumbnail : interaction.guild.iconURL())
        .setColor("#0EFEFE")
        .setDescription(string);

    return r(interaction, "", embed).then(() => delr(interaction, 30000));
}

function clearQueue(interaction, player) {
    player.queue.clear();

    const embed = new EmbedBuilder()
        .setAuthor({ name: `🎧 Queue Cleared for ${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
        .setThumbnail(player.queue.current.thumbnail ? player.queue.current.thumbnail : interaction.guild.iconURL())
        .setColor("#FF0000")
        .setDescription("The queue has been cleared.");

    return r(interaction, "", embed).then(() => delr(interaction, 30000));
}

function removeQueue(interaction, player) {
    const index = interaction.options.getInteger('index');
    const end = interaction.options.getInteger('end');
    let text;

    if (index < 1 || index > player.queue.size)
        return re(interaction, "Please provide a valid index.").then(() => delr(interaction, 7500));

    if (end && index > end)
        return re(interaction, "The end index must be greater than the start index.").then(() => delr(interaction, 7500));

    if (end && index !== end) {
        text = `Songs **${index}-${end > player.queue.size ? player.queue.size : end}** have`;
        player.queue.remove(index - 1, end);
    } else {
        text = `**${player.queue[index - 1].title}** has`;
        player.queue.remove(index - 1);
    }

    const embed = new EmbedBuilder()
        .setAuthor({ name: `🎧 Queue Edited for ${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
        .setThumbnail(player.queue.current.thumbnail ? player.queue.current.thumbnail : interaction.guild.iconURL())
        .setColor("#FF0000")
        .setDescription(`${text} been removed from the queue.`)

    return r(interaction, "", embed).then(() => delr(interaction, 30000));
}

function swapQueue(interaction, player) {
    const index1 = interaction.options.getInteger('index-1') - 1;
    const index2 = interaction.options.getInteger('index-2') - 1;

    if (index1 < 0 || index1 >= player.queue.size || index2 < 0 || index2 >= player.queue.size)
        return re(interaction, "Please provide a valid index.").then(() => delr(interaction, 7500));

    const temp = player.queue[index1];
    player.queue[index1] = player.queue[index2];
    player.queue[index2] = temp;

    const embed = new EmbedBuilder()
        .setAuthor({ name: `🎧 Queue Edited for ${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
        .setThumbnail(player.queue.current.thumbnail ? player.queue.current.thumbnail : interaction.guild.iconURL())
        .setColor("#0EFEFE")
        .setDescription(`Songs **${index1 + 1}** and **${index2 + 1}** have been swapped in the queue.`)

    return r(interaction, "", embed).then(() => delr(interaction, 30000));
}