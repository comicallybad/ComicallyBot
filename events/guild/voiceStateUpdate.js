module.exports = (client, voiceStateStart, voiceStateEnd) => {
    if (voiceStateEnd.channelID == undefined) { //When a user disconnects
        if (voiceStateEnd.id == client.user.id) { //If the user is the bot
            const channelID = voiceStateStart.channelID
            if (channelID == null) {//If the bot was disconnected
                const guildID = voiceStateEnd.guild.id;
                const player = client.music.players.get(guildID);

                //destroy the player (as it will keep trying to play)
                if (!player) return
                else client.music.players.destroy(guildID);
            }
        }
    }
}