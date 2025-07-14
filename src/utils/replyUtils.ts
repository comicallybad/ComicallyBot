import {
    CommandInteraction, MessageComponentInteraction, ModalSubmitInteraction,
    ButtonBuilder, ButtonStyle, ActionRowBuilder, Message,
    ButtonInteraction,
    AnySelectMenuInteraction
} from "discord.js";
import { SendReplyOptions, EditReplyOptions, DeleteReplyOptions, DeferReplyOptions, SendUpdateOptions } from "../types/replyUtils";

export async function sendReply(interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction, options: SendReplyOptions): Promise<Message | undefined> {
    try {
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

export async function editReply(interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction, options: EditReplyOptions): Promise<void | undefined> {
    try {
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(options);
        } else {
            await sendReply(interaction, options);
        }
    } catch (error: unknown) {
        return;
    }
}

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

        await editReply(interaction, { components: [row.toJSON()] });

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

export async function deferReply(interaction: CommandInteraction | AnySelectMenuInteraction | MessageComponentInteraction | ModalSubmitInteraction, options: DeferReplyOptions): Promise<void | undefined> {
    try {
        await interaction.deferReply(options);
    } catch (error: unknown) {
        return;
    }
}

export async function deferUpdate(interaction: AnySelectMenuInteraction | MessageComponentInteraction | ModalSubmitInteraction | ButtonInteraction): Promise<void | undefined> {
    try {
        await interaction.deferUpdate();
    } catch (error: unknown) {
        return;
    }
}

export async function sendUpdate(interaction: AnySelectMenuInteraction | ButtonInteraction, options: SendUpdateOptions): Promise<void | undefined> {
    try {
        await interaction.update(options);
    } catch (error: unknown) {
        return;
    }
}