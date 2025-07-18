/**
 * Represents the Mongoose document for a Guild Configuration.
 */
export interface IGuildConfig extends Document {
    /**
     * The MongoDB ObjectId for the document.
     */
    _id: Types.ObjectId;
    /**
     * The Discord ID of the guild.
     */
    guildID: string;
    /**
     * The name of the guild.
     */
    guildName: string;
    /**
     * An array of channel configurations.
     */
    channels: any[];
    /**
     * An array of strings representing the welcome message.
     */
    welcomeMessage: string[];
    /**
     * The ID of the reaction to delete messages.
     */
    deleteReaction: string;
}