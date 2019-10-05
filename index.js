const { Client, Collection } = require("discord.js");
const { config } = require("dotenv");
const fs = require("fs");
const mongoose = require("mongoose");
const db = require('./schemas/db.js');

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
                    commands: []
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