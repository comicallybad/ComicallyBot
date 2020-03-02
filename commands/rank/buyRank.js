const db = require("../../schemas/db.js");
const coins = require('../../schemas/coins.js');
const { findID } = require("../../functions.js");

const { stripIndents } = require("common-tags");
const { RichEmbed } = require("discord.js");

module.exports = {
    name: "buyrank",
    aliases: ["rankbuy", "purchaserank", "rankpurchase", "redeemrank", "rankredeem"],
    category: "rank",
    description: "Buys a rank with user coins.",
    permissions: "member",
    usage: "<@role|roleID>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.find(c => c.name === "mods-log") || message.channel;

        let guildID = message.guild.id;
        let userID = message.member.id;
        let userName = message.member.user.username;
        let author = message.member;

        // No bot permissions
        if (!message.guild.me.hasPermission("MANAGE_ROLES"))
            return message.reply("I do not have permissions to manage roles. Please contact a moderator.").then(m => m.delete(7500));

        //No rank to buy
        if (!args[0])
            return message.reply("Please provide a rank ID or an at mention of the rank that you wish to buy.").then(m => m.delete(7500));

        let ID = findID(message, args[0], "role");

        //check if they already have rank first, if not check if rank exists in db, then check if they have enough coins, then assign rank.
        if (args[0]) {
            if (ID) {
                if (message.member.roles.find(r => r.id === ID)) {
                    return message.reply("You already have this role!").then(m => m.delete(7500));
                } else findRole(ID)
            } else return message.reply("Please provide a valid role.").then(m => m.delete(7500));
        }

        //finds role in database/price of role
        function findRole(roleID) {
            let cost = 0;
            let roleName = "";

            db.findOne({ guildID: guildID, buyableRanks: { $elemMatch: { roleID: roleID } } }, (err, exists) => {
                if (err) console.log(err)
                if (exists) {
                    cost = (exists.buyableRanks[exists.buyableRanks.map(role => role.roleID).indexOf(roleID)].cost);
                    roleName = (exists.buyableRanks[exists.buyableRanks.map(role => role.roleID).indexOf(roleID)].roleName);
                    purchase(cost, roleName, roleID)
                } else return message.reply("This rank is not purchaseable").then(m => m.delete(7500))
            })
        }

        //finds the user in coins db, then subtracts purchase cost then attempts to assign role.
        function purchase(cost, roleName, roleID) {
            let coinsHas;

            coins.findOne({ guildID: guildID, userID: userID }, (err, exists) => {
                if (err) console.log(err)
                if (exists) {
                    coinsHas = exists.coins;

                    if (coinsHas <= cost) return message.reply("You do not have enough coins to purchase this rank!").then(m => m.delete(7500))
                    else {
                        author.addRole(roleID)
                            .then(res => {
                                exists.coins -= cost
                                exists.save().catch(err => console.log(err));
                                message.reply(`You ave successfully purchased the ${roleName} role. Click your avatar to check it out!`).then(m => m.delete(7500));

                                const embed = new RichEmbed()
                                    .setColor("#0efefe")
                                    .setThumbnail(author.displayAvatarURL)
                                    .setFooter(message.member.displayName, message.author.displayAvatarURL)
                                    .setTimestamp()
                                    .setDescription(stripIndents`**> User:** ${userName} (${userID})
                                **> Rank Bought:** ${roleName} (${roleID})
                                **> Cost:** ${cost}`);

                                logChannel.send(embed);
                            })
                            .catch(err => message.reply("Could not assign role due to: " + err + ", no coins were removed from your balance."))
                    }
                } else return message.reply("You do not have coins yet or you are not in the database!").then(m => m.delete(7500))
            })
        }
    }
}