const { s, r, del } = require("../../functions.js");
const humanizeDuration = require("humanize-duration");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "play",
    category: "music",
    description: "Resume  music or queue a song from YouTube/SoundCloud.",
    permissions: "member",
    usage: "[song|url]",
    run: (client, message, args) => {
        const voiceChannel = message.member.voice.channel;
        const checkPlayer = client.music.players.get(message.guild.id);

        if (!voiceChannel)
            return r(message.channel, message.author, "You need to be in a voice channel to play music.").then(m => del(m, 7500));

        const permissions = voiceChannel.permissionsFor(client.user);

        if (!permissions.has("VIEW_CHANNEL"))
            return r(message.channel, message.author, "I cannot view the channel you wish to connect me to!").then(m => del(m, 7500));

        if (!permissions.has("CONNECT"))
            return r(message.channel, message.author, "I cannot connect to your voice channel, make sure I have permission to!").then(m => del(m, 7500));

        if (!permissions.has("SPEAK"))
            return r(message.channel, message.author, "I cannot connect to your voice channel, make sure I have permission to!").then(m => del(m, 7500));

        if (!args[0] && !checkPlayer)
            return r(message.channel, message.author, "Please provide a song name or link to search.").then(m => del(m, 7500));

        if (!args[0] && checkPlayer.voiceChannel == voiceChannel) {
            if (!checkPlayer.playing) {
                checkPlayer.pause(checkPlayer.playing);
                return r(message.channel, message.author, `Player is now ${checkPlayer.playing ? "resumed" : "paused"}.`).then(m => del(m, 7500));
            } else return r(message.channel, message.author, "Please provide a song name or link to search.").then(m => del(m, 7500));
        } else if (!args[0] && checkPlayer.voiceChannel !== voiceChannel) {
            checkPlayer.setVoiceChannel(voiceChannel.id);
            if (!checkPlayer.playing) checkPlayer.pause(checkPlayer.playing);
            return r(message.channel, message.author, `Player has successfully joined.`).then(m => del(m, 7500));
        }

        if (checkPlayer) {
            if (!checkPlayer.playing) {
                checkPlayer.pause(checkPlayer.playing);
            }
        }

        const player = client.music.create({
            guild: message.guild.id,
            voiceChannel: voiceChannel.id,
            textChannel: message.channel.id,
            volume: 10,
            selfDeafen: true,
        });

        if (player.state !== "CONNECTED") player.connect();

        client.music.search(args.join(" "), message.author).then(async res => {
            switch (res.loadType) {
                case "TRACK_LOADED":
                    player.queue.add(res.tracks[0]);
                    r(message.channel, message.author, `Queuing \`${res.tracks[0].title}\` \`${humanizeDuration(res.tracks[0].duration)}\``).then(m => del(m, 15000));
                    if (!player.playing) player.play();
                    break;

                case "SEARCH_RESULT":
                    let index = 1;
                    const tracks = res.tracks.slice(0, 5);
                    const embed = new MessageEmbed()
                        .setAuthor("Song Selection.", message.author.displayAvatarURL())
                        .setDescription(`${tracks.map(video => `**${index++} -** ${video.title}\n`).join('')}`)
                        .setFooter("Your response time closes within the next 30 seconds. Type 'cancel' to cancel the selection");

                    const selector = await s(message.channel, '', embed);

                    const collector = message.channel.createMessageCollector({ time: 30000, max: 1 }, m => {
                        return m.author.id === message.author.id && new RegExp(`^([1-5]|cancel)$`, "i").test(m.content)
                    });

                    collector.on("collect", m => {
                        if (/cancel/i.test(m.content)) {
                            del(m, 0)
                            return collector.stop("cancelled")
                        }
                        const track = tracks[Number(m.content) - 1];
                        player.queue.add(track).catch(err => r(message.chanel, message.author, `There was an error queuing that track: ${err}`));
                        r(message.channel, message.author, `Queuing \`${track.title}\` \`${humanizeDuration(track.duration)}\``).then(m => del(m, 15000));
                        if (!player.playing) player.play();
                        del(m, 0);
                        del(selector, 0);
                    });

                    collector.on("end", (_, reason) => {
                        if (["time", "cancelled"].includes(reason)) {
                            del(selector, 0);
                            return r(message.channel, message.author, "Cancelled selection.").then(m => del(m, 15000));
                        }
                    });
                    break;

                case "PLAYLIST_LOADED":
                    res.tracks.forEach(track => player.queue.add(track));
                    const duration = humanizeDuration(res.tracks.reduce((acc, cur) => ({ duration: acc.duration + cur.duration })).duration);
                    r(message.channel, message.author, `Queuing \`${res.tracks.length}\` \`${duration}\` tracks in playlist \`${res.playlist.name}\``).then(m => del(m, 15000));
                    if (!player.playing) player.play();
                    break;
            }
        }).catch(err => r(message.channel, message.author, `${(err.message)}`).then(m => del(m, 7500)));
    }
}