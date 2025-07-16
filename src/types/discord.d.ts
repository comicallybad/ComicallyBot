import { Collection, Message, User, PartialUser, MessageComponent, MessageComponentInteraction, SlashCommandBuilder } from "discord.js";
import { Manager, Player, Track } from "moonlink.js";

interface Command {
    data: SlashCommandBuilder;
    execute: (...args: any[]) => Promise<void> | void;
}

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, any>;
        music: Manager;
        activities: string[];
    }
}

declare module "moonlink.js" {
    interface Player {
        data: Map<string, any>;
    }

    interface Track {
        thumbnail?: string | null;
        requestedBy?: User | PartialUser;
    };
}