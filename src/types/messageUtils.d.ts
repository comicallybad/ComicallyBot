import { MessageCreateOptions, MessageEditOptions } from "discord.js";

export interface SendMessageOptions extends MessageCreateOptions {}

export interface EditMessageOptions extends MessageEditOptions {}

export interface DeleteMessageOptions {
    timeout?: number;
}