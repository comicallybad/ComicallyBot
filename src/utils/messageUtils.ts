import { Message, TextChannel } from "discord.js";
import { SendMessageOptions, EditMessageOptions, DeleteMessageOptions } from "../types/messageUtils";

export async function sendMessage(channel: TextChannel, options: SendMessageOptions): Promise<Message | undefined> {
    try {
        return await channel.send(options);
    } catch (error: unknown) {
        return;
    }
}

export async function editMessage(message: Message, options: EditMessageOptions): Promise<Message | undefined> {
    try {
        return await message.edit(options);
    } catch (error: unknown) {
        return;
    }
}

export async function deleteMessage(message: Message, options?: DeleteMessageOptions): Promise<void | undefined> {
    const timeout = options?.timeout ?? 0;

    try {
        if (timeout === 0) {
            await message.delete();
            return;
        }

        setTimeout(async () => {
            try {
                const fetched = await message.fetch();
                const stopReaction = fetched.reactions.cache.get("🛑");
                if (stopReaction) {
                    const users = await stopReaction.users.fetch();
                    if (users.size > 0) return;
                }
                await message.delete();
            } catch (error) {
                return;
            }
        }, timeout);

    } catch (error: unknown) {
        return;
    }
}