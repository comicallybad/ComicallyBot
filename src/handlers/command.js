const { REST, Routes } = require('discord.js');
const { readdirSync } = require("fs");
const ascii = require("ascii-table");

let table = new ascii("Commands");
table.setHeading("Command", "Load status");

module.exports = async (client) => {
    let commands = [];
    readdirSync("./src/commands/").forEach(dir => {
        const commandFolders = readdirSync(`./src/commands/${dir}/`).filter(file => file.endsWith(".js"));

        for (let file of commandFolders) {
            const command = require(`../commands/${dir}/${file}`);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                commands.push(command.data.toJSON());
                table.addRow(file, '✅');
            } else {
                table.addRow(file, `❌`);
            }
        }
    });

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    (async () => {
        try {
            const data = await rest.put(
                Routes.applicationCommands(process.env.CLIENTID),
                { body: commands },
            );
            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            console.error(error);
        }
    })();
    console.log(table.toString());
}