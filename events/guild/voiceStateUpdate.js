module.exports = (client, voiceStateStart, voiceStateEnd) => {
    if (voiceStateEnd.id == "492495421822730250") {
        const channelID = voiceStateEnd.guild.voiceStates.cache.map(user => user).filter(user => user.id == "492495421822730250")[0].channelID
        if (channelID == null) {
            const guildID = voiceStateEnd.guild.id;
            const player = client.music.players.get(guildID);

            if (!player) return
            else client.music.players.destroy(guildID);
        }
    }
}