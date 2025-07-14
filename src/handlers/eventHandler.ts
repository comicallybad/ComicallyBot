import { Client } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";

export function loadEvents(client: Client) {
    const eventsPath = join(__dirname, "../events");

    const readEvents = (dir: string) => {
        let files;
        try {
            files = readdirSync(dir, { withFileTypes: true });
        } catch (error: unknown) {
            throw new Error(`Failed to read events directory ${dir}: ${(error as Error).message}`);
        }

        for (const file of files) {
            const filePath = join(dir, file.name);
            if (file.isDirectory()) {
                readEvents(filePath);
            } else if (file.isFile() && file.name.endsWith(".js")) {
                try {
                    const event = require(filePath).default;
                    if (event.once) {
                        client.once(event.name, (...args: any[]) => event.execute(client, ...args));
                    } else {
                        client.on(event.name, (...args: any[]) => event.execute(client, ...args));
                    }
                } catch (error: unknown) {
                    throw new Error(`Failed to load event from ${filePath}: ${(error as Error).message}`);
                }
            }
        }
    };

    readEvents(eventsPath);
}
