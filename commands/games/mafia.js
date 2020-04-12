const { del, awaitReaction } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "mafia",
    aliases: ["rlmafia", "mafiagame"],
    category: "games",
    description: "Setup a mafia game, must have at least 4 reactors.",
    permissions: "member",
    usage: "<max players must be greater than or equal to 4>",
    run: async (client, message, args) => {
        let maxPlayers = 0;

        if (!args[0])
            return message.reply('Please provide the maximum users you wish to have.').then(m => del(m, 7500));

        if (isNaN(args[0]) || parseInt(args[0]) < 4)
            return message.reply("Please provide a number greater than or equal to 4.").then(m => del(m, 7500));
        else
            maxPlayers = Math.floor(parseInt(args[0]));

        let embed = new MessageEmbed()
            .setTitle("**React below to play mafia!**")
            .setDescription(`${message.author} is hosting a mafia lobby for ${maxPlayers} players`)
            .setFooter(`Lobby requires at least ${maxPlayers} reactors within 5 minutes`, message.author.displayAvatarURL())
            .setTimestamp();

        message.channel.send(embed).then(async msg => {
            const users = await awaitReaction(msg, maxPlayers, 300000, "💯");

            if (users.length >= maxPlayers) {
                const random = Math.floor(Math.random() * maxPlayers);
                let mafiaUserID = users[random].id;
                let civilianUsers = users.filter(usr => usr.id !== mafiaUserID)

                client.users.fetch(mafiaUserID, false).then(user => {
                    user.send(`You have been selected to be **mafia** for **${message.author.username}'s** mafia game.`).then(m => del(m, 15000))
                        .catch(err => message.channel.send(`${user} you must have DM's opened to be part of the mafia`));
                });

                for (let i = 0; i < maxPlayers - 1; i++) {
                    client.users.fetch(civilianUsers[i].id, false).then(user => {
                        user.send(`You have been selected to be **civilian** for **${message.author.username}'s** mafia game.`).then(m => del(m, 15000))
                            .catch(err => message.channel.send(`${user} you must have DM's opened to be part of the mafia`));
                    });
                };

                msg.reactions.removeAll();

                embed
                    .setTitle(`${message.author.username} Mafia Game: `)
                    .setDescription(`The ${maxPlayers} players have been messaged their roles!`)
                    .setFooter('The game is on, have fun!', message.author.displayAvatarURL())
                    .setTimestamp();

                msg.edit(embed).then(m => del(m, 15000));
            } else {
                msg.reactions.removeAll();

                embed
                    .setTitle('Mafia Game: ')
                    .setDescription(`There were not at least ${maxPlayers} reactors to start the game!`)
                    .setFooter("Cancelled.", message.author.displayAvatarURL())
                    .setTimestamp();

                msg.edit(embed).then(m => del(m, 15000));
            }
        });
    }
}