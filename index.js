require('dotenv').config(); // Load environment variables from .env file

const { Client, Intents } = require('discord.js');
const client = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS,           // Enable the GUILDS intent
        Intents.FLAGS.GUILD_MESSAGES    // Enable the GUILD_MESSAGES intent
    ]
});
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
