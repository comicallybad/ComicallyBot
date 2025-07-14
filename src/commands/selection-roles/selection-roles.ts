import {
    SlashCommandBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder, MessageFlags, ChatInputCommandInteraction, TextChannel, RoleSelectMenuInteraction,
} from "discord.js";
import { sendReply, deleteReply, deferUpdate } from "../../utils/replyUtils";
import { ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("selection-roles")
        .setDescription("Manage the selection roles.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand => subcommand.setName("add").setDescription("Add selection role(s).")
            .addStringOption(option => option.setName("message").setDescription("The message to send with the selection menu."))
            .addChannelOption(option => option.setName("channel").setDescription("The channel to send the message to."))
            .addIntegerOption(option => option.setName("min").setDescription("The minimum number of roles that must be selected.").setMinValue(0).setMaxValue(25))
            .addIntegerOption(option => option.setName("max").setDescription("The maximum number of roles that can be selected.").setMinValue(0).setMaxValue(25))),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const channel = (interaction.options.getChannel("channel") || interaction.channel) as TextChannel;
        const message = interaction.options.getString("message");
        const min = interaction.options.getInteger("min") || 0;
        const max = interaction.options.getInteger("max") || 25;

        if (!channel || channel.type !== ChannelType.GuildText) {
            throw new ValidationError("The channel must be a text channel.");
        }

        if (min > max) {
            throw new ValidationError("The minimum number of roles must be less than or equal to the maximum number of roles.");
        }

        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId("roles")
            .setPlaceholder("Select role(s).")
            .setMinValues(1)
            .setMaxValues(25);

        const row = new ActionRowBuilder().addComponents(roleSelect);

        await sendReply(interaction, { content: "Select the role(s) to be added to the select menu.", components: [row.toJSON()], flags: MessageFlags.Ephemeral });

        const msg = await interaction.fetchReply();
        const filter = (i: any) => i.customId === "roles" && i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on("collect", async (i: RoleSelectMenuInteraction) => {
            if (i.customId !== "roles") return;
            await deferUpdate(i);

            if (i.values.length < min) {
                throw new ValidationError(`You must select at least ${min} role(s).`);
            }

            await sendReply(interaction, { content: "Roles have been selected.", components: [] });
            await deleteReply(interaction, { timeout: 7500 });

            const roleSelect = new StringSelectMenuBuilder()
                .setCustomId("select-menu-roles")
                .setPlaceholder("Select role(s) to join/leave.")
                .setMinValues(min)
                .setMaxValues(i.values.length > max ? max : i.values.length)
                .addOptions(i.roles.map(role => new StringSelectMenuOptionBuilder().setLabel(role.name).setValue(role.id)));

            const rowSelect = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(roleSelect);

            try {
                await (channel as TextChannel).send({ content: message ? `${message}` : undefined, components: [rowSelect.toJSON()] });
            } catch (error) {
                throw new ValidationError(`There was an error sending the select menu message: \n\`${error}\``);
            }
        });

        collector.on("end", collected => { return; });
    },
};