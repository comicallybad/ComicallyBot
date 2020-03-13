const { del } = require("../../functions.js");
const { Utils } = require("erela.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "play",
    aliases: ["p", "pplay"],
    category: "music",
    description: "Resume  music or queue a song from YouTube/Souncloud.",
    permissions: "member",
    usage: "[song|url]",
    run: (client, message, args) => {
        const voiceChannel = message.member.voice.channel;
        const checkPlayer = client.music.players.get(message.guild.id);

        if (!voiceChannel)
            return message.reply("You need to be in a voice channel to play music.").then(m => del(m, 7500));

        const permissions = voiceChannel.permissionsFor(client.user);

        if (!permissions.has("CONNECT"))
            return message.reply("I cannot connect to your voice channel, make sure I have permission to!").then(m => del(m, 7500));

        if (!permissions.has("SPEAK"))
            return message.reply("I cannot connect to your voice channel, make sure I have permission to!").then(m => del(m, 7500));

        if (!args[0] && !checkPlayer)
            return message.reply("Please provide a song name or link to search.").then(m => del(m, 7500));

        if (!args[0] && checkPlayer.voiceChannel == voiceChannel) {
            if (!checkPlayer.playing) {
                checkPlayer.pause(checkPlayer.playing);
                return message.reply(`Player is now ${checkPlayer.playing ? "resumed" : "paused"}.`).then(m => del(m, 7500));
            } else return message.reply("Please provide a song name or link to search.").then(m => del(m, 7500));
        } else if (!args[0] && checkPlayer.voiceChannel !== voiceChannel) {
            checkPlayer.setVoiceChannel(voiceChannel);
            if (!checkPlayer.playing) checkPlayer.pause(checkPlayer.playing);
            return message.reply(`Player has successfully joined.`).then(m => del(m, 7500));
        }

        if (checkPlayer) {
            if (!checkPlayer.playing) {
                checkPlayer.pause(checkPlayer.playing);
            }
        }

        const player = client.music.players.spawn({
            guild: message.guild,
            textChannel: message.channel,
            voiceChannel
        });

        player.setVoiceChannel(voiceChannel);

        client.music.search(args.join(" "), message.author).then(async res => {
            switch (res.loadType) {
                case "TRACK_LOADED":
                    player.queue.add(res.tracks[0]);
                    message.reply(`Queuing \`${res.tracks[0].title}\` \`${Utils.formatTime(res.tracks[0].duration, true)}\``).then(m => del(m, 15000));
                    if (!player.playing) player.play();
                    break;

                case "SEARCH_RESULT":
                    let index = 1;
                    const tracks = res.tracks.slice(0, 5);
                    const embed = new MessageEmbed()
                        .setAuthor("Song Selection.", message.author.displayAvatarURL)
                        .setDescription(tracks.map(video => `**${index++} -** ${video.title}`))
                        .setFooter("Your response time closes within the next 30 seconds. Type 'cancel' to cancel the selection");

                    const selector = await message.channel.send(embed);

                    const collector = message.channel.createMessageCollector(m => {
                        return m.author.id === message.author.id && new RegExp(`^([1-5]|cancel)$`, "i").test(m.content)
                    }, { time: 30000, max: 1 });

                    collector.on("collect", m => {
                        if (/cancel/i.test(m.content)) {
                            del(m, 0)
                            return collector.stop("cancelled")
                        }
                        const track = tracks[Number(m.content) - 1];
                        player.queue.add(track)
                        message.reply(`Queuing \`${track.title}\` \`${Utils.formatTime(track.duration, true)}\``).then(m => del(m, 15000));
                        if (!player.playing) player.play();
                        del(m, 0);
                        if (selector.deletable) del(selector, 0);
                    });

                    collector.on("end", (_, reason) => {
                        if (["time", "cancelled"].includes(reason)) return message.reply("Cancelled selection.").then(m => del(m, 15000));
                        if (selector.deletable) del(selector, 0);
                    });
                    break;

                case "PLAYLIST_LOADED":
                    res.playlist.tracks.forEach(track => player.queue.add(track));
                    const duration = Utils.formatTime(res.playlist.tracks.reduce((acc, cur) => ({ duration: acc.duration + cur.duration })).duration, true);
                    message.reply(`Queuing \`${res.playlist.tracks.length}\` \`${duration}\` tracks in playlist \`${res.playlist.info.name}\``).then(m => del(m, 15000));
                    if (!player.playing) player.play();
                    if (selector.deletable) del(selector, 0);
                    break;
            }
        }).catch(err => message.reply(err.message))
    }
}