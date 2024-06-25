// functions/setCommands.js
const { REST } = require('discord.js');
const { Routes } = require('discord-api-types/v9');

module.exports = async function setCommands(clientId, guildId, token) {
    const commands = [
        {
            name: 'setapplication',
            description: 'Set the channel for whitelist applications',
        },
        {
            name: 'postapplication',
            description: 'Post the application embed message in the application channel',
        }
    ];

    const rest = new REST({ version: '9' }).setToken(token);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error refreshing application (/) commands:', error);
    }
};
