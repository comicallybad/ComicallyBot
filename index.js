const { Client, Collection } = require("discord.js");
const { config } = require("dotenv");
const fs = require("fs");
const mongoose = require("mongoose");
const db = require('./schemas/db.js');
const coins = require('./schemas/coins.js')

global.prefix = "_";

const client = new Client({
    disableEveryone: true
})

client.commands = new Collection();
client.aliases = new Collection();
client.categories = new fs.readdirSync("./commands/")

config({
    path: __dirname + "/.env"
});

["command"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

client.on("ready", () => {
    console.log(`${client.user.username} online.`);

    client.user.setPresence({
        status: "online",
        game: {
            name: prefix + "help",
            type: "STREAMING"
        }
    });
    mongoose.connect("mongodb://localhost/ComicallyBOT2", {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
    dbSetup();
})

client.on("message", async message => {
    if (message.author.bot) return;
    if (!message.guild) return;
    addCoins(message)
    if (!message.content.startsWith(prefix)) return;
    if (!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if (cmd.length === 0) return;

    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    if (command)
        command.run(client, message, args);
});

function addCoins(message) {
    let guildName = message.guild.name;
    let guildID = message.guild.id;
    let userID = message.member.id;
    let userName = message.author.username;
    let coinsToAdd = Math.floor(Math.random() * 25) + 1;

    db.findOne({ guildID: guildID }, (err, exists) => {
        if (!exists) console.log("Error finding coins multiplier in database")
        if (exists) {
            if (exists.coinsMultiplier)
                coinsToAdd = coinsToAdd * exists.coinsMultiplier;
            else {
                exists.coinsMultiplier = 1
                exists.save().catch(err => console.log(err));
            }
        }
    }).catch(err => console.log(err)).then(function () {
        coins.findOne({ guildID: guildID, userID: userID }, (err, exists) => {
            if (err) console.log(err)
            if (!exists) {
                const newCoins = new coins({
                    _id: mongoose.Types.ObjectId(),
                    guildID: guildID, guildName: guildName,
                    userID: userID, userName: userName, coins: coinsToAdd
                })
                newCoins.save().catch(err => console.log(err));
            } else {
                exists.guildName = guildName;
                exists.userName = userName;
                exists.coins = exists.coins + coinsToAdd;
                exists.save().catch(err => console.log(err))
            }
        })
    })
}

function dbSetup() {
    let guildsID = (client.guilds.map(guild => guild.id));
    let guildsName = (client.guilds.map(guild => guild.name));
    let commands = (client.commands.map(cmd => cmd.name))

    guildsID.forEach((element, guildIndex) => { //for each guild
        db.findOne({ guildID: guildsID[guildIndex] }, (err, exists) => {
            if (err) console.log(err)
            if (!exists) {
                const newDB = new db({
                    _id: mongoose.Types.ObjectId(),
                    guildID: guildsID[guildIndex],
                    guildName: guildsName[guildIndex],
                    commands: [],
                    coinsMultiplier: 1
                })
                newDB.save().catch(err => console.log(err))
            } else {
                exists.guildName = guildsName[guildIndex]; //in case name changed
                exists.save().catch(err => console.log(err))
            }
        }).then(function () {
            commandSetup(guildsID[guildIndex])
        }).catch(err => console.log(err))
    });

    function commandSetup(guildID) {
        commands.forEach((element, cmdIndex) => {
            db.findOne({
                guildID: guildID,
                commands: { $elemMatch: { name: commands[cmdIndex] } }
            }, (err, exists) => {
                if (err) console.log(err)
                if (!exists) {
                    db.updateOne({ guildID: guildID }, {
                        $push: { commands: { name: commands[cmdIndex], status: false } }
                    }).catch(err => console.log(err))
                }
            })
        });
    }
}

client.login(process.env.TOKEN);