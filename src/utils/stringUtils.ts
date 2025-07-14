import { Message, PartialMessage } from "discord.js";

export function escapeMarkdown(text: string): string {
    return text.replace(/\|\|/g, "\\|\\").replace(/([_\*\`~])/g, "\\$1");
}

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
            content += `  Answer ${index + 1}: ${answer.text}\n`;
        });
        if (message.poll.expiresAt) {
            const now = new Date();
            if (message.poll.expiresAt.getTime() <= now.getTime()) {
                content += `  Status: Expired\n`;
            } else {
                const durationMs = message.poll.expiresAt.getTime() - now.getTime();
                const durationSeconds = Math.floor(durationMs / 1000);
                content += `  Expires In: ${durationSeconds} seconds\n`;
            }
        }
    }

    return content.trim() || "No content or attachments.";
}