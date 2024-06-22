require('dotenv').config();
const { Client, Intents } = require('discord.js');
const axios = require('axios');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const token = process.env.DISCORD_TOKEN;
const fivemServerIP = 'pacific-myrtle.gl.at.ply.gg:42340'; // e.g., '127.0.0.1:30120'

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (!message.content.startsWith('/')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'status') {
        try {
            const response = await axios.get(`http://${fivemServerIP}/info.json`);
            if (response.data) {
                message.channel.send('The server is up and running!');
            } else {
                message.channel.send('The server is down.');
            }
        } catch (error) {
            message.channel.send('Could not fetch server status.');
        }
    }

    if (command === 'players') {
        try {
            const response = await axios.get(`http://${fivemServerIP}/players.json`);
            if (response.data) {
                const playerCount = response.data.length;
                message.channel.send(`There are ${playerCount} players online.`);
            } else {
                message.channel.send('Could not fetch player count.');
            }
        } catch (error) {
            message.channel.send('Could not fetch player count.');
        }
    }

    // Add more commands as needed
});

client.login(token);
