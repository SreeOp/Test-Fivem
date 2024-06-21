module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        if (!message.content.startsWith('!') || message.author.bot) return;

        const args = message.content.slice(1).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (!client.commands.has(commandName)) return;

        const command = client.commands.get(commandName);

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            await message.reply('There was an error executing that command.');
        }
    });
};
