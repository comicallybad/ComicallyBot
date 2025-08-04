import { Message, PartialMessage, Client, escapeMarkdown } from "discord.js";
import humanizeDuration from "humanize-duration";

/**
 * Formats a song title and author into a hyperlinked string for use in embeds.
 * @param title The title of the song.
 * @param author The author of the song.
 * @param url The URL of the song.
 * @returns The formatted and hyperlinked song title.
 */
export function formatSongTitle(title: string, author: string, url: string): string {
    const normalizeString = (str: string) => {
        return str.toLowerCase().replace(/\s/g, '').replace(/vevo$/i, '');
    };

    const normalizedTitle = normalizeString(title);
    const normalizedAuthor = normalizeString(author);

    const authorInTitle = normalizedTitle.includes(normalizedAuthor);

    const escapedTitle = escapeMarkdown(title);
    const escapedAuthor = escapeMarkdown(author);

    const formattedTitle = authorInTitle ? escapedTitle : `${escapedTitle} by ${escapedAuthor}`;
    return `[**${formattedTitle}**](${url})`;
}

/**
 * Formats the content of a message, including text, embeds, attachments, and polls.
 * @param message The message to format.
 * @returns A string representation of the message's content.
 */
export function formatMessageContent(message: Message | PartialMessage): string {
    let content = "";

    if (message.content) {
        content += `Text: ${message.content}\n`;
    }

    if (message.embeds && message.embeds.length > 0) {
        message.embeds.forEach((embed, index) => {
            content += `Embed ${index + 1}:\n`;
            if (embed.title) content += `  Title: ${embed.title}\n`;
            if (embed.description) content += `  Description: ${embed.description}\n`;
            if (embed.fields && embed.fields.length > 0) {
                embed.fields.forEach(field => {
                    content += `  ${field.name}: ${field.value}\n`;
                });
            }
            if (embed.image) content += `  Image: ${embed.image.url}\n`;
            if (embed.url) content += `  URL: ${embed.url}\n`;
        });
    }

    if (message.attachments && message.attachments.size > 0) {
        message.attachments.forEach((attachment, index) => {
            content += `Attachment ${index + 1}:\n`;
            content += `  Name: ${attachment.name}\n`;
            content += `  URL: ${attachment.url}\n`;
            if (attachment.contentType?.startsWith("image")) content += `  (Image)\n`;
        });
    }

    if (message.poll) {
        content += `Poll Question: ${message.poll.question.text}\n`;
        message.poll.answers.forEach((answer, index) => {
            content += `  Answer ${index}: ${answer.text}\n`;
        });
        if (message.poll.expiresAt) {
            const now = new Date();
            if (message.poll.expiresAt.getTime() <= now.getTime()) {
                content += `  Status: Expired\n`;
            } else {
                const durationMs = message.poll.expiresAt.getTime() - now.getTime();
                const duration = humanizeDuration(durationMs, {
                    round: true,
                });
                content += `  Expires In: ${duration}\n`;
            }
        }
    }

    return content.trim() || "No content or attachments.";
}

/**
 * Fetches and formats a guild's name and ID.
 * @param client The Discord client instance.
 * @param id The ID of the guild to fetch.
 * @returns A Promise that resolves to the formatted guild name and ID string.
 */
export const getGuildNameAndId = async (client: Client, id: string): Promise<string> => {
    try {
        const guild = await client.guilds.fetch(id);
        return `${guild.name} (\`${id}\`)`;
    } catch (error) {
        return `(\`${id}\`)`;
    }
};