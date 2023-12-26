const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { r } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Responds with an embed of a users avatar.')
        .addUserOption(option => option.setName('user').setDescription('Target user')),
    execute: (interaction) => {
        const user = interaction.options.getUser('user') || interaction.user;
        const embed = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setColor("#000000")
            .setTitle(`**Avatar**`)
            .setImage(user.displayAvatarURL({ size: 4096, dynamic: true }));

        return r(interaction, "", embed);
    }
}