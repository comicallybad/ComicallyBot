import { REST, Routes, SlashCommandBuilder } from "discord.js";

interface Command {
    data: SlashCommandBuilder;
    execute: (...args: any[]) => Promise<void> | void;
}


import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();


const globalCommands: any[] = [];
const devCommands: any[] = [];

const foldersPath = path.join(__dirname, "commands");
const commandFolders: string[] = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles: string[] = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command: { default: Command } = require(filePath);
        const commandModule: Command = command.default || command;

        if ("data" in commandModule && "execute" in commandModule) {
            if (folder === "owner") {
                devCommands.push(commandModule.data.toJSON());
            } else {
                globalCommands.push(commandModule.data.toJSON());
            }
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN as string);

(async () => {
    try {
        console.log(`Started refreshing ${globalCommands.length} global application (/) commands.`);

        const globalData: any = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID as string),
            { body: globalCommands },
        );

        console.log(`Successfully reloaded ${globalData.length} global application (/) commands.`);

        if (process.env.DEV_GUILD_ID) {
            console.log(`Started refreshing ${devCommands.length} development guild application (/) commands.`);

            const devData: any = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID as string, process.env.DEV_GUILD_ID as string),
                { body: devCommands },
            );

            console.log(`Successfully reloaded ${devData.length} development guild application (/) commands.`);
        } else {
            console.log("DEV_GUILD_ID is not set. Skipping deployment of owner commands to a development guild.");
        }
    } catch (error: unknown) {
        console.error(error);
    }
})();