const { r } = require("../../../utils/functions/functions.js");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("good")
        .setDescription("Sends a cute goodmorning or goodnight message.")
        .addSubcommand(command => command.setName("morning").setDescription("Sends a cute goodmorning message.")
            .addUserOption(option => option.setName("user").setDescription("Target user"))
            .addStringOption(option => option.setName("message").setDescription("Message to send").setMaxLength(1024)))
        .addSubcommand(command => command.setName("night").setDescription("Sends a cute goodnight message.")
            .addUserOption(option => option.setName("user").setDescription("Target user"))
            .addStringOption(option => option.setName("message").setDescription("Message to send").setMaxLength(1024))),
    execute: (interaction) => {
        const subcommand = interaction.options.getSubcommand();
        const userOption = interaction.options.get("user");
        const messageOption = interaction.options.get("message");
        const member = interaction.member;
        const user = interaction.user;
        const embed = new EmbedBuilder()
            .setFooter({ text: `Message from: ${member.displayName}`, iconURL: user.displayAvatarURL() })
            .setTimestamp();

        if (subcommand === "morning") {
            const targetUser = userOption ? userOption.member : member;
            const message = messageOption ? messageOption.value : `Goodmorning ${targetUser.displayName} rise and shine!`;

            embed
                .setColor(targetUser.displayHexColor === '#000000' ? '#ffffff' : targetUser.displayHexColor)
                .setThumbnail(targetUser.user.displayAvatarURL())
                .addFields({ name: 'Goodmorning Message:', value: message });
        } else if (subcommand === "night") {
            const targetUser = userOption ? userOption.member : member;
            const message = messageOption ? messageOption.value : `Goodnight ${targetUser.displayName} sleep tight!`;

            embed
                .setColor(targetUser.displayHexColor === '#000000' ? '#ffffff' : targetUser.displayHexColor)
                .setThumbnail(targetUser.user.displayAvatarURL())
                .addFields({ name: 'Goodnight Message:', value: message });
        }

        return r(interaction, '', embed);
    }
}