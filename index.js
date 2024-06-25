require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const setCommands = require('./functions/setCommands');
const handleInteractions = require('./functions/handleInteractions');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const port = process.env.PORT || 3000;

client.once('ready', () => {
    console.log('Bot is online!');

    // Set the slash commands
    setCommands(clientId, guildId, token);

    // Set bot status
    client.user.setActivity('ZyX', { type: 'WATCHING' });
});

let applicationChannelId = null;
let applicationReviewChannelId = process.env.APPLICATION_REVIEW_CHANNEL_ID;
let acceptedChannelId = process.env.ACCEPTED_CHANNEL_ID;
let pendingChannelId = process.env.PENDING_CHANNEL_ID;
let rejectedChannelId = process.env.REJECTED_CHANNEL_ID;

client.on('interactionCreate', async interaction => {
    await handleInteractions(client, interaction, applicationReviewChannelId, applicationChannelId, acceptedChannelId, pendingChannelId, rejectedChannelId);
});

client.login(token);

// Set up an Express server
const app = express();

app.get('/', (req, res) => {
    res.send('Hello, this is your Discord bot running.');
});

app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
});
