import { APIEmbed, APIActionRowComponent } from "discord.js";
import { APIButtonComponent, APISelectMenuComponent, APITextInputComponent } from "discord-api-types/v10";

export type APIMessageActionRowComponent = APIButtonComponent | APISelectMenuComponent | APITextInputComponent;

export interface SendReplyOptions {
    content?: string;
    embeds?: APIEmbed[];
    components?: APIActionRowComponent<APIMessageActionRowComponent>[];
    flags?: number;
}

export interface EditReplyOptions {
    content?: string;
    embeds?: APIEmbed[];
    components?: APIActionRowComponent<APIMessageActionRowComponent>[];
    flags?: number;
}

export interface DeleteReplyOptions {
    content?: string;
    embeds?: APIEmbed[];
    timeout?: number;
}

export interface DeferReplyOptions {
    flags?: number;
}

export interface DeferUpdateOptions {
    flags?: number;
}

export interface SendUpdateOptions {
    content?: string;
    embeds?: APIEmbed[];
    components?: APIActionRowComponent<APIMessageActionRowComponent>[];
    flags?: number;
}