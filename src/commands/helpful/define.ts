import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, User } from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { ValidationError } from "../../utils/customErrors";
import * as wd from "word-definition";

export default {
    data: new SlashCommandBuilder()
        .setName("define")
        .setDescription("Defines a word for you.")
        .addStringOption(option => option.setName("word").setDescription("Word to define").setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        const word: string = interaction.options.getString("word", true);
        const user: User = interaction.user;

        const getDefinition = (): Promise<any> => {
            return new Promise((resolve, reject) => {
                wd.getDef(word, "en", null, (result: any) => {
                    if (!result.definition) {
                        reject(new ValidationError("Sorry, I could not find that word."));
                    }

                    if (result.definition.length >= 1024) {
                        reject(new ValidationError("This definition is too long of a string for a message embed sorry!"));
                    }
                    resolve(result);
                });
            });
        };

        const result = await getDefinition();

        const embed = new EmbedBuilder()
            .setColor("#0efefe")
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setTitle(`Definition of: ${word}`)
            .setDescription(result.definition)
            .setFooter({ text: `Category of type: ${result.category}` })
            .setTimestamp();

        await sendReply(interaction, { embeds: [embed] });
        await deleteReply(interaction, { timeout: 30000 });
    }
};