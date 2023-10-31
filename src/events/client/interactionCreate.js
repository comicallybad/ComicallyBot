module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        if (command.setDefaultMemberPermissions?.length) {
            for (const permission of command.setDefaultMemberPermissions) {
                if (!interaction.member.permission.has(permission)) {
                    interaction.reply({ content: `You are missing ${permission} permissions to use this command.`, ephemeral: true })
                    return;
                }
            }
        }
        await command.execute(client, interaction);
    } catch (error) {
        console.error(error.stack);
        interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
}