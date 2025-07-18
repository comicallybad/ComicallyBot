import { APIEmbed, APIActionRowComponent, EmbedBuilder, ActionRowBuilder, MessageActionRowComponentBuilder } from "discord.js";
import { APIButtonComponent, APISelectMenuComponent, APITextInputComponent } from "discord-api-types/v10";

/**
 * Represents a union type for various message action row components.
 */
export type APIMessageActionRowComponent = APIButtonComponent | APISelectMenuComponent | APITextInputComponent;

/**
 * Options for sending a reply to a Discord interaction.
 */
export interface SendReplyOptions {
    /**
     * The content of the reply message.
     */
    content?: string;
    /**
     * An array of embeds to send with the reply.
     */
    embeds?: (APIEmbed | EmbedBuilder)[];
    /**
     * An array of action rows to include with the reply.
     */
    components?: (APIActionRowComponent<APIMessageActionRowComponent> | ActionRowBuilder<MessageActionRowComponentBuilder>)[];
    /**
     * Message flags to apply to the reply (e.g., `MessageFlags.Ephemeral`).
     */
    flags?: number;
}

/**
 * Options for editing an existing reply to a Discord interaction.
 */
export interface EditReplyOptions {
    /**
     * The new content for the edited reply message.
     */
    content?: string;
    /**
     * An array of embeds to update the reply with.
     */
    embeds?: (APIEmbed | EmbedBuilder)[];
    /**
     * An array of action rows to update the reply with.
     */
    components?: (APIActionRowComponent<APIMessageActionRowComponent> | ActionRowBuilder<MessageActionRowComponentBuilder>)[];
    /**
     * Message flags to apply to the edited reply.
     */
    flags?: number;
}

/**
 * Options for deleting a reply to a Discord interaction.
 */
export interface DeleteReplyOptions {
    /**
     * The content of the message to be deleted (optional, for context).
     */
    content?: string;
    /**
     * An array of embeds in the message to be deleted (optional, for context).
     */
    embeds?: (APIEmbed | EmbedBuilder)[];
    /**
     * The timeout in milliseconds before deleting the reply.
     */
    timeout?: number;
}

/**
 * Options for deferring a reply to a Discord interaction.
 */
export interface DeferReplyOptions {
    /**
     * Message flags to apply to the deferred reply (e.g., `MessageFlags.Ephemeral`).
     */
    flags?: number;
}

/**
 * Options for deferring an update to a message component interaction.
 */
export interface DeferUpdateOptions {
    /**
     * Message flags to apply to the deferred update.
     */
    flags?: number;
}

/**
 * Options for sending an update to a message component interaction.
 */
export interface SendUpdateOptions {
    /**
     * The content of the update message.
     */
    content?: string;
    /**
     * An array of embeds to send with the update.
     */
    embeds?: (APIEmbed | EmbedBuilder)[];
    /**
     * An array of action rows to include with the update.
     */
    components?: (APIActionRowComponent<APIMessageActionRowComponent> | ActionRowBuilder<MessageActionRowComponentBuilder>)[];
    /**
     * Message flags to apply to the update.
     */
    flags?: number;
}