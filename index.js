require('dotenv').config(); // Load environment variables from .env file

const { Client } = require('discord.js');
const client = new Client();
require('discord-buttons')(client);

// Import functions
const applyFunction = require('./functions/apply');

client.once('ready', () => {
    console.log('Bot is online!');
});

// Event listener for button clicks
client.on('clickButton', async (button) => {
    if (button.id === 'apply_button') {
        await applyFunction.handleApply(client, button);
    }
});

// Login using environment variable
client.login(process.env.DISCORD_TOKEN);
