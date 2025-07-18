import {
    CommandInteraction, MessageComponentInteraction, ModalSubmitInteraction, ButtonBuilder,
    ButtonStyle, ActionRowBuilder, Message, ButtonInteraction, AnySelectMenuInteraction, EmbedBuilder
} from "discord.js";
import { SendReplyOptions, EditReplyOptions, DeleteReplyOptions, DeferReplyOptions, SendUpdateOptions } from "../types/replyUtils";

/**
 * Sends a reply to a Discord interaction, handling deferred and replied states.
 * @param interaction The interaction to reply to.
 * @param options The options for the reply.
 * @returns A Promise that resolves to the sent message, or undefined if an error occurs.
 */
export async function sendReply(interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction, options: SendReplyOptions): Promise<Message | undefined> {
    try {
        if (options.embeds) {
            options.embeds = options.embeds.map(embed => embed instanceof EmbedBuilder ? embed.toJSON() : embed);
        }
        if (options.components) {
            options.components = options.components.map(component => component instanceof ActionRowBuilder ? component.toJSON() : component);
        }

        if (interaction.deferred || interaction.replied) {
            await interaction.followUp(options);
            return await interaction.fetchReply() as Message;
        } else {
            await interaction.reply(options);
            return await interaction.fetchReply() as Message;
        }
    } catch (error: unknown) {
        return;
    }
}

/**
 * Edits an existing reply to a Discord interaction.
 * @param interaction The interaction to edit the reply of.
 * @param options The new options for the reply.
 * @returns A Promise that resolves when the reply is edited, or undefined if an error occurs.
 */
export async function editReply(interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction, options: EditReplyOptions): Promise<void | undefined> {
    try {
        if (options.embeds) {
            options.embeds = options.embeds.map(embed => embed instanceof EmbedBuilder ? embed.toJSON() : embed);
        }
        if (options.components) {
            options.components = options.components.map(component => component instanceof ActionRowBuilder ? component.toJSON() : component);
        }

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(options);
        } else {
            await sendReply(interaction, options);
        }
    } catch (error: unknown) {
        return;
    }
}

/**
 * Deletes a reply to a Discord interaction after a timeout, with buttons to save or delete immediately.
 * @param interaction The interaction to delete the reply of.
 * @param options The options for deleting the reply, including an optional timeout.
 * @returns A Promise that resolves when the deletion process is initiated, or undefined if an error occurs.
 */
export async function deleteReply(interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction, options: DeleteReplyOptions): Promise<void | undefined> {
    const timeout = options.timeout ?? 30000;

    try {
        if (timeout === 0) {
            await interaction.deleteReply();
            return;
        }
        if (!interaction.replied && !interaction.deferred) return;

        const saveButton = new ButtonBuilder()
            .setCustomId(`save-${interaction.user.id}`)
            .setLabel("Save Message")
            .setStyle(ButtonStyle.Success);

        const deleteButton = new ButtonBuilder()
            .setCustomId(`delete-${interaction.user.id}`)
            .setLabel("Delete Message")
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(saveButton, deleteButton);

        await editReply(interaction, { components: [row] });

        setTimeout(async () => {
            try {
                const fetchedMessage = await interaction.fetchReply();
                if (fetchedMessage && fetchedMessage.components.length > 0) {
                    await interaction.deleteReply();
                }
            } catch (error: unknown) {
                return;
            }
        }, timeout);

    } catch (error: unknown) {
        return;
    }
}

/**
 * Defers a reply to a Discord interaction.
 * @param interaction The interaction to defer.
 * @param options The options for deferring the reply.
 * @returns A Promise that resolves when the reply is deferred, or undefined if an error occurs.
 */
export async function deferReply(interaction: CommandInteraction | AnySelectMenuInteraction | MessageComponentInteraction | ModalSubmitInteraction, options: DeferReplyOptions): Promise<void | undefined> {
    try {
        await interaction.deferReply(options);
    } catch (error: unknown) {
        return;
    }
}

/**
 * Defers an update to a message component interaction.
 * @param interaction The interaction to defer the update of.
 * @returns A Promise that resolves when the update is deferred, or undefined if an error occurs.
 */
export async function deferUpdate(interaction: AnySelectMenuInteraction | MessageComponentInteraction | ModalSubmitInteraction | ButtonInteraction): Promise<void | undefined> {
    try {
        await interaction.deferUpdate();
    } catch (error: unknown) {
        return;
    }
}

/**
 * Sends an update to a message component interaction.
 * @param interaction The interaction to update.
 * @param options The options for the update.
 * @returns A Promise that resolves when the update is sent, or undefined if an error occurs.
 */
export async function sendUpdate(interaction: AnySelectMenuInteraction | ButtonInteraction, options: SendUpdateOptions): Promise<void | undefined> {
    try {
        await interaction.update(options);
    } catch (error: unknown) {
        return;
    }
}