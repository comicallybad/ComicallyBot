module.exports = (client, voiceStateStart, voiceStateEnd) => {
    if (!voiceStateStart.channelID && voiceStateEnd.channelID) { //If user joins a channel
        if (voiceStateEnd.id == client.user.id) { //If the user is the bot
            if (!voiceChannels.some(channel => channel.channelID === voiceStateStart.channelID))
                voiceChannels.push({ channelID: voiceStateEnd.channelID, users: client.channels.cache.get(voiceStateEnd.channelID).members.size })
        } else { //Update user count
            if (voiceChannels.find(channel => channel.channelID == voiceStateEnd.channelID))
                voiceChannels.find(channel => channel.channelID == voiceStateEnd.channelID).users += 1;
        }
    } else if (voiceStateStart.channelID && !voiceStateEnd.channelID) { //If user disconnects
        if (voiceStateStart.id == client.user.id) { //If the user is the bot
            const guildID = voiceStateEnd.guild.id;
            const player = client.music.players.get(guildID);
            if (player) client.music.players.destroy(guildID);
            if (voiceChannels.some(channel => channel.channelID === voiceStateStart.channelID))
                voiceChannels.splice(voiceChannels.findIndex(channel => channel.channelID === voiceStateStart.channelID), 1)
        } else {//Update user count
            if (voiceChannels.find(channel => channel.channelID == voiceStateStart.channelID)) {
                voiceChannels.find(channel => channel.channelID == voiceStateStart.channelID).users -= 1;
            }
        }
    } else if (voiceStateStart.channelID && voiceStateEnd.channelID) {//If user moves
        if (voiceStateStart.id == client.user.id && voiceStateStart.channelID) { //If the user is the bot
            if (voiceChannels.some(channel => channel.channelID === voiceStateStart.channelID))
                voiceChannels.splice(voiceChannels.findIndex(channel => channel.channelID === voiceStateStart.channelID), 1)
            voiceChannels.push({ channelID: voiceStateEnd.channelID, users: client.channels.cache.get(voiceStateEnd.channelID).members.size })
        } else {//Update user count on both start and end channel
            if (voiceChannels.find(channel => channel.channelID == voiceStateStart.channelID)) {
                voiceChannels.find(channel => channel.channelID == voiceStateStart.channelID).users = client.channels.cache.get(voiceStateStart.channelID).members.size;
            } else if (voiceChannels.find(channel => channel.channelID == voiceStateEnd.channelID)) {
                voiceChannels.find(channel => channel.channelID == voiceStateEnd.channelID).users = client.channels.cache.get(voiceStateEnd.channelID).members.size;
            }
        }
    }
    checkUsers(client);
}

function checkUsers(client) {
    voiceChannels.forEach(channel => {
        if (channel.users <= 1)
            checkDisconnect(client, channel.channelID);
    });
}

function checkDisconnect(client, channelID) {
    let disconnectChannel = setTimeout(function () {
        disconnect(client, channelID)
    }, 900000); //15 minutes 
}

function disconnect(client, channelID) {
    if (voiceChannels.find(channel => channel.channelID == channelID))
        if (voiceChannels.find(channel => channel.channelID == channelID).users <= 1) {
            const guildID = client.channels.cache.get(channelID).guild.id;
            const player = client.music.players.get(guildID);
            if (player) client.music.players.destroy(guildID);
            else client.channels.cache.get(channelID).disconnect()
            if (voiceChannels.some(channel => channel.channelID === channelID))
                voiceChannels.splice(voiceChannels.find(channel => channel.channelID === channelID), 1)
        }
}