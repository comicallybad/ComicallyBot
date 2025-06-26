const disconnectTimers = new Map();

module.exports = (client, oldState, newState) => {
    const botId = client.user.id;
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    function isBotAlone(channel) {
        return channel && channel.members.size === 1 && channel.members.has(botId);
    }

    if (oldChannel && (!newChannel || oldChannel.id !== newChannel.id)) {
        if (isBotAlone(oldChannel)) {
            const timer = setTimeout(() => {
                const player = client.music.players.get(oldChannel.guild.id);
                if (player) player.destroy();
                disconnectTimers.delete(oldChannel.id);
            }, 180000); // 3 minutes

            disconnectTimers.set(oldChannel.id, timer);
        }
    }

    if (newChannel) {
        if (disconnectTimers.has(newChannel.id)) {
            clearTimeout(disconnectTimers.get(newChannel.id));
            disconnectTimers.delete(newChannel.id);
        }
    }
};