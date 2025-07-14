import { Client, Collection } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";

export function loadCommands(client: Client) {
    client.commands = new Collection();
    const commandsPath = join(__dirname, "../commands");

    function readCommands(dir: string) {
        let files;
        try {
            files = readdirSync(dir, { withFileTypes: true });
        } catch (error: unknown) {
            throw new Error(`Failed to read commands directory ${dir}: ${(error as Error).message}`);
        }

        for (const file of files) {
            const filePath = join(dir, file.name);
            if (file.isDirectory()) {
                readCommands(filePath);
            } else if (file.isFile() && file.name.endsWith(".js")) {
                try {
                    const command = require(filePath).default;
                    client.commands.set(command.data.name, command);
                } catch (error: unknown) {
                    throw new Error(`Failed to load command from ${filePath}: ${(error as Error).message}`);
                }
            }
        }
    }

    readCommands(commandsPath);
}
