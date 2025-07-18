import { Collection, Message, User, PartialUser, MessageComponent, MessageComponentInteraction, SlashCommandBuilder } from "discord.js";
import { Manager, Player, Track } from "moonlink.js";

/**
 * Represents a Discord command structure.
 */
interface Command {
    /**
     * The SlashCommandBuilder instance defining the command's data.
     */
    data: SlashCommandBuilder;
    /**
     * The function to execute when the command is called.
     * @param args - Arguments passed to the execute function.
     */
    execute: (...args: any[]) => Promise<void> | void;
}

declare module "discord.js" {
    export interface Client {
        /**
         * A collection of all registered commands.
         */
        commands: Collection<string, any>;
        /**
         * The Moonlink music manager instance.
         */
        music: Manager;
        /**
         * An array of strings representing the bot's rotating activities.
         */
        activities: string[];
    }
}

declare module "moonlink.js" {
    interface Player {
        /**
         * A map to store custom data related to the player.
         */
        data: Map<string, any>;
    }

    interface Track {
        /**
         * The URL of the track's thumbnail.
         */
        thumbnail?: string | null;
        /**
         * The user who requested the track.
         */
        requestedBy?: User | PartialUser;
    };
}