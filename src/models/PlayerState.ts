import { Schema, model, Document } from "mongoose";
import { Track } from "moonlink.js";

interface IPlayerState extends Document {
    guildId: string;
    voiceChannelId: string;
    textChannelId: string;
    messageId: string;
    queue: Track[];
    previous: Track[];
    currentTrack: Track | null;
    position: number;
    playing: boolean;
    paused: boolean;
    volume: number;
    loop: "none" | "track" | "queue";
    autoPlay: boolean;
}

const PlayerStateSchema = new Schema<IPlayerState>({
    guildId: { type: String, required: true, unique: true },
    voiceChannelId: { type: String, required: true },
    textChannelId: { type: String, required: true },
    messageId: { type: String, required: true },
    queue: { type: [Object], default: [] },
    previous: { type: [Object], default: [] },
    currentTrack: { type: Object, default: null },
    position: { type: Number, default: 0 },
    playing: { type: Boolean, default: false },
    paused: { type: Boolean, default: false },
    volume: { type: Number, default: 100 },
    loop: { type: String, enum: ["none", "track", "queue"], default: "none" },
    autoPlay: { type: Boolean, default: false },
});

export default model<IPlayerState>("PlayerState", PlayerStateSchema);
