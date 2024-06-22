require('dotenv').config();
const Discord = require('discord.js');
const FiveM = require('fivem');

const client = new Discord.Client();
const fivemServer = new FiveM.Server('pacific-myrtle.gl.at.ply.gg:42340:30120'); // Replace with your server IP and port

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (message) => {
  if (message.author.bot || !message.content.startsWith('/')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'players') {
    try {
      const players = await fivemServer.getPlayers();

      if (players && players.length > 0) {
        const playerList = players.map((player) => player.name).join('\n');
        message.channel.send(`Current players:\n${playerList}`);
      } else {
        message.channel.send('No players online.');
      }
    } catch (error) {
      console.error('Failed to fetch player list:', error);
      message.channel.send('Failed to fetch player list.');
    }
  }
});

const TOKEN = process.env.DISCORD_TOKEN;
client.login(TOKEN);
