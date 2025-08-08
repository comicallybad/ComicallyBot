import {
    ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, MessageComponentInteraction,
    ModalSubmitInteraction, EmbedBuilder, ComponentType, ButtonInteraction
} from "discord.js";
import { editReply, deleteReply, deferUpdate } from "./replyUtils";

/**
 * Prompts the user with a message containing buttons and waits for a response.
 * @param interaction The interaction to reply to.
 * @param row The action row containing the buttons.
 * @param timeout The time in milliseconds to wait for a response.
 * @returns A Promise that resolves to the collected button interaction, or rejects if the prompt times out.
 */
export function messagePrompt(interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction, row: ActionRowBuilder<ButtonBuilder>, timeout: number): Promise<ButtonInteraction> {
    return new Promise(async (resolve, reject) => {
        try {
            const reply = await interaction.fetchReply();
            const collector = reply.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id,
                componentType: ComponentType.Button,
                time: timeout
            });

            collector.on("collect", (i: ButtonInteraction) => {
                collector.stop();
                resolve(i);
            });

            collector.on("end", (collected, reason) => {
                if (reason === "time") {
                    reject("time");
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Creates a paginated list from an array of items, displayed in an embed with navigation buttons.
 * @param interaction The interaction to reply to.
 * @param array The array of items to paginate.
 * @param embed The base embed to use for the pages.
 * @param parameter The label for each item in the list.
 * @param size The number of items to display per page.
 * @param page The initial page number to display.
 */
export async function pageList(interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction, array: any[], embed: EmbedBuilder, parameter: string, size: number, page: number): Promise<void> {
    let pages = Math.ceil(array.length / size) - 1, newPage = page;
    embed.setFooter({ text: "Use the buttons to navigate, discard, or save." });
    embed.data.fields = [];

    for (let i = newPage * size; i < (newPage + 1) * size && i < array.length; i++) {
        embed.addFields({ name: `${parameter} ${i + 1}`, value: `${array[i]}` });
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("previous")
                .setLabel("⬅️")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(newPage === 0),
            new ButtonBuilder()
                .setCustomId("next")
                .setLabel("➡️")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(newPage >= pages),
            new ButtonBuilder()
                .setCustomId("delete")
                .setLabel("🗑️")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId("save")
                .setLabel("❤️")
                .setStyle(ButtonStyle.Success)
        );

    await editReply(interaction, { embeds: [embed.toJSON()], components: [row.toJSON()] });

    try {
        const i = await messagePrompt(interaction, row, 30000);
        await deferUpdate(i);
        switch (i.customId) {
            case "next":
                if (newPage < pages) {
                    pageList(interaction, array, embed, parameter, size, ++newPage);
                } else pageList(interaction, array, embed, parameter, size, newPage);
                break;
            case "previous":
                if (newPage > 0) {
                    pageList(interaction, array, embed, parameter, size, --newPage);
                } else pageList(interaction, array, embed, parameter, size, newPage);
                break;
            case "delete":
                await deleteReply(interaction, {});
                break;
            case "save":
                embed.setFooter(null);
                await editReply(interaction, { embeds: [embed.toJSON()], components: [] });
                break;
        }
    } catch (error: unknown) {
        if (error === "time") {
            await deleteReply(interaction, { timeout: 0 });
        } else {
            return;
        }
    }
};