import { Document, Types } from "mongoose";

export interface IGuildConfig extends Document {
    _id: Types.ObjectId;
    guildID: string;
    guildName: string;
    channels: any[];
    welcomeMessage: string[];
    deleteReaction: string;
}