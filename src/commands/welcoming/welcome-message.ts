import {
    SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle,
    ChatInputCommandInteraction, MessageFlags, GuildMember, ButtonBuilder, ButtonStyle
} from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { sendMessage } from "../../utils/messageUtils";
import { GuildConfig } from "../../models/GuildConfig";
import { ValidationError } from "../../utils/customErrors";
import { messagePrompt } from "../../utils/paginationUtils";
import { getLogChannel } from "../../utils/channelUtils";

export default {
    data: new SlashCommandBuilder()
        .setName('welcome-message')
        .setDescription('Manage the welcome message for new users.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(subcommand => subcommand.setName('get').setDescription('Get the current welcome message.'))
        .addSubcommand(subcommand => subcommand.setName('set').setDescription('Set a new welcome message.'))
        .addSubcommand(subcommand => subcommand.setName('remove').setDescription('Remove the current welcome message.')),
    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();
        const guildID = interaction.guildId;
        if (!guildID) return;

        const dbResult = await GuildConfig.findOne({ guildID: guildID });

        if (subcommand === 'get') return await getWelcomeMessage(interaction, dbResult);
        else if (subcommand === 'set') return await setWelcomeMessage(interaction, dbResult);
        else if (subcommand === 'remove') return await removeWelcomeMessage(interaction, dbResult);
    }
};

async function getWelcomeMessage(interaction: ChatInputCommandInteraction, dbResult: any) {
    if (!dbResult || !dbResult.welcomeMessage || dbResult.welcomeMessage.length === 0) {
        throw new ValidationError("A welcome message has not been set.");
    }
    await sendReply(interaction, { content: `The current welcome message is set to: ${dbResult.welcomeMessage}` });
    await deleteReply(interaction, { timeout: 30000 });
}

async function setWelcomeMessage(interaction: ChatInputCommandInteraction, dbResult: any) {
    const modal = new ModalBuilder()
        .setCustomId(`welcome-${interaction.id}`)
        .setTitle("Welcome Message");

    const textInput = new TextInputBuilder()
        .setCustomId("welcome-input")
        .setLabel("Welcome Message")
        .setPlaceholder("Enter the welcome message. (<user> & <#channelID> to mention).")
        .setMaxLength(2000)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);

    const submitted = await interaction.awaitModalSubmit({
        time: 300000,
        filter: i => i.user.id === interaction.user.id && i.customId.includes(interaction.id)
    }).catch(async () => {
        await deleteReply(interaction, { timeout: 0 });
        throw new ValidationError("Modal submission timed out.");
    });

    if (!submitted || !submitted.fields) return;

    const newMessage = submitted.fields.getTextInputValue("welcome-input");

    const guildID = interaction.guildId;
    if (!guildID) return;

    await GuildConfig.updateOne({ guildID: guildID }, { welcomeMessage: newMessage }, { upsert: true });

    const logChannel = getLogChannel(interaction.guild!, ["mod-logs"]);
    const embed = new EmbedBuilder()
        .setColor("#0efefe")
        .setTitle("Welcome Message Changed")
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: (interaction.member as GuildMember)?.displayName || interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp()
        .addFields(
            { name: '__**Message**__', value: `${newMessage}`, inline: true },
            { name: '__**Moderator**__', value: `${interaction.user}`, inline: true }
        );

    await sendReply(submitted, { content: `The welcome message has been changed to: ${newMessage}`, flags: MessageFlags.Ephemeral });
    if (logChannel) {
        await sendMessage(logChannel, { embeds: [embed] });
    }
}

async function removeWelcomeMessage(interaction: ChatInputCommandInteraction, dbResult: any) {
    const guildID = interaction.guildId;
    if (!guildID) return;

    if (!dbResult || !dbResult.welcomeMessage || dbResult.welcomeMessage.length === 0) {
        throw new ValidationError("A welcome message has not been set.");
    }

    const promptEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setAuthor({ name: `This verification becomes invalid after 30s.`, iconURL: interaction.user.displayAvatarURL() })
        .setDescription(`Do you want to remove the welcome message?`);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder().setCustomId("confirm").setLabel("Confirm").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger)
        );

    await sendReply(interaction, { embeds: [promptEmbed], components: [row] });

    try {
        const collected = await messagePrompt(interaction, row, 30000);

        if (collected.customId === "cancel") {
            await sendReply(collected, { content: "Selection cancelled.", flags: MessageFlags.Ephemeral });
            await deleteReply(interaction, { timeout: 0 });
            return;
        }

        if (collected.customId === "confirm") {
            dbResult.welcomeMessage = [];
            await dbResult.save();

            const logChannel = getLogChannel(interaction.guild!, ["mod-logs"]);
            const embed = new EmbedBuilder()
                .setColor("#0efefe")
                .setTitle("Welcome Message Removed")
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: (interaction.member as GuildMember)?.displayName || interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp()
                .addFields({ name: '__**Moderator**__', value: `${interaction.user}`, inline: true });

            await sendReply(collected, { content: "The welcome message has been removed.", flags: MessageFlags.Ephemeral });
            await deleteReply(interaction, { timeout: 0 });
            if (logChannel) await sendMessage(logChannel, { embeds: [embed] });
            return;
        }
    } catch (err: unknown) {
        if (err === "time") {
            await deleteReply(interaction, { timeout: 0 });
            throw new ValidationError("Prompt timed out.");
        } else {
            throw err;
        }
    }
}