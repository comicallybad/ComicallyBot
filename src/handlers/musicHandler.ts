import { Client } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";

export function loadMusicEvents(client: Client) {
    const eventsPath = join(__dirname, "../../dist/events/music");

    const readMusicEvents = (dir: string) => {
        let files;
        try {
            files = readdirSync(dir, { withFileTypes: true });
        } catch (error: unknown) {
            throw new Error(`Failed to read music events directory ${dir}: ${(error as Error).message}`);
        }

        for (const file of files) {
            const filePath = join(dir, file.name);
            if (file.isDirectory()) {
                readMusicEvents(filePath);
            }
            else if (file.isFile() && file.name.endsWith(".js")) {
                try {
                    const event = require(filePath).default;
                    if (event.once) {
                        client.music.once(event.name, (...args: any[]) => event.execute(client, ...args));
                    } else {
                        client.music.on(event.name, (...args: any[]) => event.execute(client, ...args));
                    }
                } catch (error: unknown) {
                    throw new Error(`Failed to load music event from ${filePath}: ${(error as Error).message}`);
                }
            }
        }
    };

    readMusicEvents(eventsPath);
}