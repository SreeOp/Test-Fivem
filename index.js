require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const token = process.env.TOKEN;
const fivemServerIP = 'play.unityverse.in'; // Replace with your FiveM server IP
const fivemServerPort = '30120'; // Replace with your FiveM server port

const updateStatus = async () => {
    try {
        const response = await axios.get(`http://${fivemServerIP}:${fivemServerPort}/players.json`);
        const playerCount = response.data.length;
        client.user.setActivity(`server players: ${playerCount}`, { type: 'WATCHING' });
    } catch (error) {
        console.error('Error fetching player count:', error);
        client.user.setActivity('server offline', { type: 'WATCHING' });
    }
};

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    updateStatus();
    setInterval(updateStatus, 60000); // Update status every 60 seconds
});

client.on('messageCreate', message => {
    if (message.content.startsWith('/players')) {
        axios.get(`http://${fivemServerIP}:${fivemServerPort}/players.json`)
            .then(response => {
                const playerCount = response.data.length;
                message.channel.send(`There are currently ${playerCount} players online.`);
            })
            .catch(error => {
                console.error('Error fetching player count:', error);
                message.channel.send('Error fetching player count.');
            });
    }
});

client.login(token);
