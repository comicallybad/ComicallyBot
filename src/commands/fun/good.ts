import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, User, GuildMember, InteractionContextType } from "discord.js";
import { sendReply } from "../../utils/replyUtils";
import { ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("good")
        .setDescription("Sends a cute goodmorning or goodnight message.")
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(subcommand => subcommand.setName("morning").setDescription("Sends a cute goodmorning message.")
            .addUserOption(option => option.setName("user").setDescription("Target user"))
            .addStringOption(option => option.setName("message").setDescription("Message to send").setMaxLength(1024)))
        .addSubcommand(subcommand => subcommand.setName("night").setDescription("Sends a cute goodnight message.")
            .addUserOption(option => option.setName("user").setDescription("Target user"))
            .addStringOption(option => option.setName("message").setDescription("Message to send").setMaxLength(1024))),
    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();
        const userOption = interaction.options.getUser("user");
        const messageOption = interaction.options.getString("message");
        const member = interaction.member as GuildMember;

        let targetMember: GuildMember;
        if (userOption) {
            const fetchedMember = interaction.guild?.members.cache.get(userOption.id);
            if (fetchedMember) {
                targetMember = fetchedMember;
            } else {
                throw new ValidationError("Target user not found in this guild.");
            }
        } else {
            targetMember = member;
        }

        const embed = new EmbedBuilder()
            .setFooter({ text: `Message from: ${member.displayName}`, iconURL: member.user.displayAvatarURL() })
            .setTimestamp();

        if (subcommand === "morning") {
            const message = messageOption || `Goodmorning ${targetMember.displayName} rise and shine!`;

            embed
                .setColor(targetMember.displayHexColor === "#000000" ? "#ffffff" : targetMember.displayHexColor)
                .setThumbnail(targetMember.user.displayAvatarURL())
                .addFields({ name: "Goodmorning Message:", value: message });
        } else if (subcommand === "night") {
            const message = messageOption || `Goodnight ${targetMember.displayName} sleep tight!`;

            embed
                .setColor(targetMember.displayHexColor === "#000000" ? "#ffffff" : targetMember.displayHexColor)
                .setThumbnail(targetMember.user.displayAvatarURL())
                .addFields({ name: "Goodnight Message:", value: message });
        }

        await sendReply(interaction, { embeds: [embed] });
    }
};