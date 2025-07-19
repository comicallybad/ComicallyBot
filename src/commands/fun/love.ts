import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, GuildMember, InteractionContextType } from "discord.js";
import { deleteReply, sendReply } from "../../utils/replyUtils";
import { ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("love")
        .setDescription("Calculates the love affinity you have for another person.")
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option => option.setName("target").setDescription("The user to calculate the love affinity with")),
    async execute(interaction: ChatInputCommandInteraction) {
        let person: GuildMember | null = interaction.options.getMember("target") as GuildMember | null;

        const interactionMember = interaction.member as GuildMember;

        if (!person || interaction.user.id === person.id) {
            const allMembers = [
                ...((await interaction.guild!.members.fetch())
                        .filter(m => m.id !== interaction.user.id)
                ).values()
            ];

            if (allMembers.length === 0) {
                throw new ValidationError("There are no other members in this guild to calculate love with.");
            }
            person = allMembers[Math.floor(Math.random() * allMembers.length)];
        }

        if (!person) {
            throw new ValidationError("Could not determine a target for love calculation.");
        }

        const love = Math.random() * 100;
        const loveIndex = Math.floor(love / 10);
        const loveLevel = "💖".repeat(loveIndex) + "💔".repeat(10 - loveIndex);

        const embed = new EmbedBuilder()
            .setColor("#ffb6c1")
            .addFields({
                name: `☁ **${person.displayName}** loves **${interactionMember.displayName}** this much:`,
                value: `💟 ${Math.floor(love)}%\n\n${loveLevel}`
            }).setTimestamp();

        await sendReply(interaction, { embeds: [embed] });
        await deleteReply(interaction, { timeout: 30000 });
    }
};