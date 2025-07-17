import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChatInputCommandInteraction, GuildMember, DiscordAPIError, } from "discord.js";
import { sendReply, editReply, deleteReply } from "../../utils/replyUtils";
import { getLogChannel } from "../../utils/channelUtils";
import { GuildConfig } from "../../models/GuildConfig";
import { PermissionError, ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("delete-reaction")
        .setDescription("Manages the delete reaction emoji.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand((subcommand) =>
            subcommand.setName("get").setDescription("Shows the current delete reaction emoji."))
        .addSubcommand((subcommand) =>
            subcommand.setName("set").setDescription("Sets an emoji to which, when added as a reaction, will delete the message.")
                .addStringOption((option) =>
                    option.setName("emoji").setDescription("The emoji to set as the delete reaction.").setRequired(true)))
        .addSubcommand((subcommand) =>
            subcommand.setName("remove").setDescription("Removes the delete reaction emoji.")),
    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "get":
                return getDeleteReaction(interaction);
            case "set":
                return setDeleteReaction(interaction);
            case "remove":
                return removeDeleteReaction(interaction);
        }
    },
};

async function getDeleteReaction(interaction: ChatInputCommandInteraction) {
    const guildConfig = await GuildConfig.findOne({ guildID: interaction.guild!.id });
    if (!guildConfig || !guildConfig.deleteReaction) {
        throw new ValidationError("A delete reaction emoji has not been set.");
    }

    const reaction = guildConfig.deleteReaction;
    await sendReply(interaction, {
        content: `The current delete reaction has been set to: ${reaction}`,
    });
    await deleteReply(interaction, { timeout: 30000 });
}

async function setDeleteReaction(interaction: ChatInputCommandInteraction) {
    const me = interaction.guild!.members.me!;
    if (!me.permissions.has(PermissionFlagsBits.ManageMessages)) {
        throw new PermissionError("I need the `Manage Messages` permission for this command to function.");
    }

    if (!me.permissions.has(PermissionFlagsBits.AddReactions)) {
        throw new PermissionError("I need the `Add Reactions` permission to validate the emoji you provide.");
    }

    const reaction = interaction.options.getString("emoji", true);

    const validationMessage = await sendReply(interaction, {
        content: "Validating Reaction Emoji...",
    });

    if (!validationMessage) {
        throw new ValidationError("There was an issue sending a reply. Please try again.");
    }

    try {
        await validationMessage.react(reaction);
    } catch (error) {
        if (error instanceof DiscordAPIError) {
            if (error.code === 10014) {
                throw new ValidationError("The emoji provided is unknown or invalid. Please try a different one.");
            } else if (error.code === 50001) {
                throw new PermissionError("I don't have permission to add reactions in this channel.");
            }
        }
        throw new ValidationError(`The provided emoji could not be used. Please ensure it's a standard emoji or a custom emoji this server has access to.`);
    }

    await editReply(interaction, {
        content: "Delete reaction emoji has been verified and set.",
    });

    await GuildConfig.updateOne(
        { guildID: interaction.guild!.id },
        { $set: { deleteReaction: reaction } },
        { upsert: true }
    );

    const logChannel = getLogChannel(interaction.guild!, ["mod-logs"]);
    if (logChannel) {
        const embed = new EmbedBuilder()
            .setTitle("Delete Reaction Set")
            .setColor("#0efefe")
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({
                text: (interaction.member as GuildMember).displayName,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp()
            .setFields(
                { name: "__**Reaction**__", value: `${reaction}`, inline: true },
                { name: "__**Moderator**__", value: `${interaction.member}`, inline: true }
            );
        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            await editReply(interaction, {
                content: `Delete reaction emoji has been set, but I couldn't send a confirmation to the log channel. Please ensure I have \`Send Messages\` permissions in ${logChannel}.`,
            });
        }
    } else {
        await editReply(interaction, {
            content: "Delete reaction emoji has been set, but I couldn't find a log channel named `mod-logs`, or I am missing permissions. The confirmation was not logged.",
        });
    }

    await deleteReply(interaction, { timeout: 10000 });
}

async function removeDeleteReaction(interaction: ChatInputCommandInteraction) {
    const guildConfig = await GuildConfig.findOne({ guildID: interaction.guild!.id });
    if (!guildConfig || !guildConfig.deleteReaction) {
        throw new ValidationError("A delete reaction emoji has not been set.");
    }

    await GuildConfig.updateOne(
        { guildID: interaction.guild!.id },
        { $unset: { deleteReaction: "" } }
    );

    await sendReply(interaction, {
        content: "The delete reaction emoji has been removed.",
    });
    await deleteReply(interaction, { timeout: 7500 });
}