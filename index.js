const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

// Replace with your server IP and port if it's not the default (30120)
const SERVER_IP = 'pvp.velocitydistrict.fun';
// const SERVER_PORT = 'your_server_port'; // Uncomment if using a non-default port

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  updatePlayerCount();
  setInterval(updatePlayerCount, 60000); // Update every 60 seconds
});

client.on('messageCreate', message => {
  if (message.content.startsWith('/')) {
    handleCommand(message);
  }
});

async function updatePlayerCount() {
  try {
    const response = await axios.get(`http://${SERVER_IP}:30120/players.json`); // Default port 30120
    // const response = await axios.get(`http://${SERVER_IP}:${SERVER_PORT}/players.json`); // Use if custom port
    const playerCount = response.data.length;
    client.user.setActivity(`server players: ${playerCount}`, { type: 'WATCHING' });
  } catch (error) {
    console.error('Error fetching player count:', error);
    client.user.setActivity('server offline', { type: 'WATCHING' });
  }
}

function handleCommand(message) {
  const args = message.content.slice(1).split(' ');
  const command = args.shift().toLowerCase();

  if (command === 'players') {
    fetchPlayerCount(message);
  } else if (command === 'status') {
    fetchServerStatus(message);
  }
}

async function fetchPlayerCount(message) {
  try {
    const response = await axios.get(`http://${SERVER_IP}:30120/players.json`); // Default port 30120
    // const response = await axios.get(`http://${SERVER_IP}:${SERVER_PORT}/players.json`); // Use if custom port
    const players = response.data;
    const playerList = players.map(player => player.name).join(', ');
    message.channel.send(`Current players (${players.length}): ${playerList}`);
  } catch (error) {
    message.channel.send('Error fetching player count.');
  }
}

async function fetchServerStatus(message) {
  try {
    const response = await axios.get(`http://${SERVER_IP}:30120/info.json`); // Default port 30120
    // const response = await axios.get(`http://${SERVER_IP}:${SERVER_PORT}/info.json`); // Use if custom port
    const serverInfo = response.data;
    message.channel.send(`Server status: ${serverInfo.vars.sv_hostname}`);
  } catch (error) {
    message.channel.send('Error fetching server status.');
  }
}

client.login(process.env.DISCORD_TOKEN);

