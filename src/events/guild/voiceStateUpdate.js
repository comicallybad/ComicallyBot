module.exports = (client, voiceStateStart, voiceStateEnd) => {
    const startChannel = voiceStateStart.channelId;
    const endChannel = voiceStateEnd.channelId;
    const guildID = voiceStateStart.guild.id ? voiceStateStart.guild.id : voiceStateEnd.guild.id;

    if (!startChannel && endChannel) {                                             //If user joins a channel
        if (voiceStateEnd.id == client.user.id) {                                    //If the user is the bot
            if (!channelFind(startChannel))                                            //If VC is not in array, push it
                voiceChannels.push({ channelID: endChannel, users: getSize(client, endChannel) })
        } else {
            if (channelFind(endChannel))
                channelFind(endChannel).users += 1;                             //Update user count
        }
    } else if (startChannel && !endChannel) {                                    //If user disconnects
        if (voiceStateStart.id == client.user.id) {                                   //If the user is the bot
            const player = client.music.players.get(guildID);                 //Fetch player
            if (player) client.music.players.get(guildID).destroy();          //Destroy Player
            if (channelFind(startChannel))                                              //If VC is in array
                channelsSplice(startChannel)                                           //Splice VC from array
        } else {
            if (channelFind(startChannel))                                              //If  VC is in array
                channelFind(startChannel).users -= 1;                             //Update user count
        }
    } else if (startChannel && endChannel) {                                     //If user moves
        if (voiceStateStart.id == client.user.id && startChannel) {       //If the user is the bot
            if (channelFind(startChannel))                                              //If VC is in array
                channelsSplice(startChannel);                                          //Splice VC from array
            voiceChannels.push({ channelID: endChannel, users: getSize(client, endChannel) });      //If VC is not in array, push it
        } else {
            if (channelFind(startChannel))                                                                  //If VC is in array
                channelFind(startChannel).users = getSize(client, startChannel);        //Update user count
            if (channelFind(endChannel))                                                                   //If VC is in array
                channelFind(endChannel).users = getSize(client, endChannel);          //Update user count
        }
    }
    checkUsers(client);                                                                         //Check for bot left inactive
}

//Get size of channel, if deleted, return 0;
function getSize(client, channel) {
    if (client.channels.cache.get(channel))
        return client.channels.cache.get(channel).members.size;
    else return 0;
}

//Find VC within voiceChannel array
function channelFind(channelID) {
    return voiceChannels.find(channel => channel.channelID === channelID)
}

//Splice VC from voiceChannel array
function channelsSplice(channelID) {
    return voiceChannels.splice(voiceChannels.findIndex(channel => channel.channelID === channelID), 1)
}

//Check if 0 users, if 0, start checkDisconnect
function checkUsers(client) {
    voiceChannels.forEach(channel => {
        if (channel.users <= 1)
            checkDisconnect(client, channel.channelID);
    });
}

//If bot is left alone, leave. If user joins back, clearInterval
function checkDisconnect(client, channelID) {
    const disconnectChannel = setTimeout(() => {
        clearInterval(intervalCheck);
        disconnect(client, channelID);
    }, 180000); //5 minutes == 300000 || 3 minutes == 180000
    const intervalCheck = setInterval(() => {
        if (getSize(client, channelID) > 1) {
            clearInterval(intervalCheck);
            clearTimeout(disconnectChannel)
        }
    }, 1000);
}

//Disconnect bot and remove VC from voceChannels array
function disconnect(client, channelID) {
    if (!(voiceChannels.find(channel => channel.channelID == channelID))) return;
    if (!(voiceChannels.find(channel => channel.channelID == channelID).users <= 1)) return;
    if (channelFind(channelID)) channelsSplice(channelID)
    const guildID = client.channels.cache.get(channelID).guild?.id || undefined;
    const player = client.music.players.get(guildID) || undefined;
    if (player) client.music.players.get(guildID).destroy();
}