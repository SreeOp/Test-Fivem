const { Client, Intents } = require('discord.js');
const { config } = require('dotenv');
const { sendApplicationMessage, handleApplicationInteraction } = require('./functions/whitelistApplication');

// Load environment variables from .env file
config();

// Create a new Discord client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Bot token from environment variable
const TOKEN = process.env.DISCORD_TOKEN;

// Event listener for when the bot is ready
client.once('ready', () => {
    console.log('Bot is ready');
});

// Event listener for handling interactions
client.on('interactionCreate', async (interaction) => {
    try {
        await handleApplicationInteraction(interaction);
    } catch (error) {
        console.error('Error handling interaction:', error);
        await interaction.reply({ content: 'An error occurred while handling your interaction.', ephemeral: true });
    }
});

// Log in to Discord with your app's token
client.login(TOKEN).then(() => {
    console.log('Logged in to Discord');
    // Replace 'CHANNEL_ID' with the ID of the channel where you want to send the application message
    sendApplicationMessage(client, '1253323014003757189');
}).catch((error) => {
    console.error('Error logging in to Discord:', error);
});
