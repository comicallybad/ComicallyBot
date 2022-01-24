module.exports = (client, voiceStateStart, voiceStateEnd) => {
    let startChannel = voiceStateStart.channelId;
    let endChannel = voiceStateEnd.channelId;

    if (!startChannel && endChannel) { //If user joins a channel
        if (voiceStateEnd.id == client.user.id) { //If the user is the bot
            if (!channelsSome(startChannel)) {
                voiceChannels.push({ channelID: endChannel, users: getSize(client, endChannel) })
            }
        } else { //Update user count
            if (channelsFind(endChannel)) {
                channelsFind(endChannel).users += 1;
            }
        }
    } else if (startChannel && !endChannel) { //If user disconnects
        if (voiceStateStart.id == client.user.id) { //If the user is the bot
            const guildID = voiceStateEnd.guild.id;
            const player = client.music.players.get(guildID);
            if (player) client.music.players.get(guildID).destroy();
            if (channelsSome(startChannel)) {
                channelsSplice(startChannel)
            }
        } else {//Update user count
            if (channelsFind(startChannel)) {
                channelsFind(startChannel).users -= 1;
            }
        }
    } else if (startChannel && endChannel) {//If user moves
        if (voiceStateStart.id == client.user.id && startChannel) { //If the user is the bot
            if (channelsSome(startChannel)) {
                channelsSplice(startChannel);
            }
            voiceChannels.push({ channelID: endChannel, users: getSize(client, endChannel) })
        } else {//Update user count on both start and end channel
            if (channelsSome(startChannel)) {
                channelsFind(startChannel).users = getSize(client, startChannel);
            } else if (channelsSome(endChannel)) {
                channelsFind(endChannel).users = getSize(client, endChannel);
            }
        }
    }
    checkUsers(client);
}

function getSize(client, channel) {
    if (client.channels.cache.get(channel)) {
        return client.channels.cache.get(channel).members.size;
    } else return 0;
}

function channelsFind(channelID) {
    return voiceChannels.find(channel => channel.channelID == channelID)
}

function channelsSome(channelID) {
    return voiceChannels.some(channel => channel.channelID === channelID)
}

function channelsSplice(channelID) {
    voiceChannels.splice(voiceChannels.findIndex(channel => channel.channelID === channelID), 1)
}

function checkUsers(client) {
    voiceChannels.forEach(channel => {
        if (channel.users <= 1)
            checkDisconnect(client, channel.channelID);
    });
}

function checkDisconnect(client, channelID) {
    let disconnectChannel = setTimeout(() => {
        clearInterval(intervalCheck);
        disconnect(client, channelID);
    }, 300000); //5 minutes == 300000
    let intervalCheck = setInterval(() => {
        var size = getSize(client, channelID)
        if (size > 1) {
            clearInterval(intervalCheck);
            clearTimeout(disconnectChannel)
        }
    }, 1000);
}

function disconnect(client, channelID) {
    if (voiceChannels.find(channel => channel.channelID == channelID))
        if (voiceChannels.find(channel => channel.channelID == channelID).users <= 1) {
            const guildID = client.channels.cache.get(channelID).guild.id;
            const player = client.music.players.get(guildID);
            if (player) client.music.players.get(guildID).destroy();
            else getVoiceConnection(guildID).destroy();
            if (channelsSome(channelID)) channelsSplice(channelID)
        }
}