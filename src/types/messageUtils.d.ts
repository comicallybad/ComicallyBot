import { MessageCreateOptions, MessageEditOptions, EmbedBuilder, ActionRowBuilder, MessageActionRowComponentBuilder } from "discord.js";
import { APIEmbed, APIActionRowComponent } from "discord.js";
import { APIMessageActionRowComponent } from "./replyUtils";

/**
 * Options for sending a message.
 */
export interface SendMessageOptions extends MessageCreateOptions {
    /**
     * An array of embeds to send with the message.
     */
    embeds?: (APIEmbed | EmbedBuilder)[];
    /**
     * An array of action rows to send with the message.
     */
    components?: (APIActionRowComponent<APIMessageActionRowComponent> | ActionRowBuilder<MessageActionRowComponentBuilder>)[];
}

/**
 * Options for editing an existing message.
 */
export interface EditMessageOptions extends MessageEditOptions {
    /**
     * An array of embeds to update the message with.
     */
    embeds?: (APIEmbed | EmbedBuilder)[];
    /**
     * An array of action rows to update the message with.
     */
    components?: (APIActionRowComponent<APIMessageActionRowComponent> | ActionRowBuilder<MessageActionRowComponentBuilder>)[];
}

/**
 * Options for deleting a message.
 */
export interface DeleteMessageOptions {
    /**
     * The timeout in milliseconds before deleting the message. Defaults to 0 (immediate deletion).
     */
    timeout?: number;
}