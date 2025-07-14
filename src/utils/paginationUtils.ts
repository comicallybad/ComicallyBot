import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    MessageComponentInteraction,
    ModalSubmitInteraction,
    EmbedBuilder,
    ComponentType
} from "discord.js";
import { editReply, deleteReply, deferUpdate } from "./replyUtils";
import { ValidationError } from "./customErrors";

export async function messagePrompt(interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction, row: ActionRowBuilder<ButtonBuilder>, timeout: number) {
    return new Promise((resolve, reject) => {
        const collector = interaction.channel?.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            componentType: ComponentType.Button,
            time: timeout
        });

        if (!collector) {
            return;
        }

        collector.on("collect", i => {
            collector.stop();
            resolve(i);
        });

        collector.on("end", (collected, reason) => {
            if (reason === "time") {
                reject("time");
            }
        });
    });
}

export async function pageList(interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction, array: any[], embed: EmbedBuilder, parameter: string, size: number, page: number) {
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
                .setDisabled(newPage === pages),
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
        const i: any = await messagePrompt(interaction, row, 30000);
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
            throw new ValidationError("Prompt timed out.");
        } else {
            throw error;
        }
    }
};
