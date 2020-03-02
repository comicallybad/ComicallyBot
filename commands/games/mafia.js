const { awaitReaction } = require("../../functions.js");
const { RichEmbed } = require("discord.js");

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
            return message.reply('Please provide the maximum users you wish to have.').then(m => m.delete(7500));

        if (isNaN(args[0]) || parseInt(args[0]) < 4)
            return message.reply("Please provide a number greater than or equal to 4.").then(m => m.delete(7500));
        else
            maxPlayers = Math.floor(parseInt(args[0]));

        let embed = new RichEmbed()
            .setTitle("**React below to play mafia!**")
            .setDescription(`${message.author.username} is hosting a mafia lobby for ${maxPlayers} players`)
            .setFooter(`Lobby requires at least ${maxPlayers} reactors within 5 minutes`)
            .setTimestamp();

        message.channel.send(embed).then(async msg => {
            const users = await awaitReaction(msg, 300000, "💯");

            if (users.length >= maxPlayers) {
                const random = Math.floor(Math.random() * maxPlayers);
                let mafiaUserID = users[random].id;
                let civilianUsers = users.filter(usr => usr.id !== mafiaUserID)

                client.fetchUser(mafiaUserID, false).then(user => {
                    user.send(`You have been selected to be **mafia** for **${message.author.username}'s** mafia game.`).then(m => m.delete(150000))
                });

                for (let i = 0; i < maxPlayers - 1; i++) {
                    client.fetchUser(civilianUsers[i].id, false).then(user => {
                        user.send(`You have been selected to be **civilian** for **${message.author.username}'s** mafia game.`).then(m => m.delete(150000))
                    });
                };

                msg.clearReactions();

                embed
                    .setTitle(`${message.author.username} Mafia Game: `)
                    .setDescription(`The ${maxPlayers} players have been messaged their roles!`)
                    .setFooter('The game is on, have fun!')
                    .setTimestamp();

                msg.edit(embed).then(m => m.delete(150000))
            } else {
                msg.clearReactions();

                embed
                    .setTitle('Mafia Game: ')
                    .setDescription(`There were not at least ${maxPlayers} reactors to start the game!`)
                    .setFooter('')
                    .setTimestamp();

                msg.edit(embed).then(m => m.delete(150000));
            }
        });
    }
}