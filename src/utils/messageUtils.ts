import { Message, TextChannel, EmbedBuilder, ActionRowBuilder } from "discord.js";
import { SendMessageOptions, EditMessageOptions, DeleteMessageOptions } from "../types/messageUtils";

/**
 * Sends a message to a specified text channel.
 * @param channel The text channel to send the message to.
 * @param options The options for the message.
 * @returns A Promise that resolves to the sent message, or undefined if an error occurs.
 */
export async function sendMessage(channel: TextChannel, options: SendMessageOptions): Promise<Message | undefined> {
    try {
        if (options.embeds) {
            options.embeds = options.embeds.map(embed => embed instanceof EmbedBuilder ? embed.toJSON() : embed);
        }
        if (options.components) {
            options.components = options.components.map(component => component instanceof ActionRowBuilder ? component.toJSON() : component);
        }
        return await channel.send(options as any);
    } catch (error: unknown) {
        return;
    }
}

/**
 * Edits an existing message.
 * @param message The message to edit.
 * @param options The new options for the message.
 * @returns A Promise that resolves to the edited message, or undefined if an error occurs.
 */
export async function editMessage(message: Message, options: EditMessageOptions): Promise<Message | undefined> {
    try {
        if (options.embeds) {
            options.embeds = options.embeds.map(embed => embed instanceof EmbedBuilder ? embed.toJSON() : embed);
        }
        if (options.components) {
            options.components = options.components.map(component => component instanceof ActionRowBuilder ? component.toJSON() : component);
        }
        return await message.edit(options as any);
    } catch (error: unknown) {
        return;
    }
}

/**
 * Deletes a message after a specified timeout.
 * @param message The message to delete.
 * @param options The options for deleting the message, including an optional timeout.
 * @returns A Promise that resolves when the deletion process is initiated, or undefined if an error occurs.
 */
export async function deleteMessage(message: Message, options?: DeleteMessageOptions): Promise<void | undefined> {
    const timeout = options?.timeout ?? 0;

    try {
        if (timeout === 0) {
            await message.delete();
            return;
        }

        setTimeout(async () => {
            try {
                const fetched = await message.fetch();
                const stopReaction = fetched.reactions.cache.get("🛑");
                if (stopReaction) {
                    const users = await stopReaction.users.fetch();
                    if (users.size > 0) return;
                }
                await message.delete();
            } catch (error) {
                return;
            }
        }, timeout);

    } catch (error: unknown) {
        return;
    }
}