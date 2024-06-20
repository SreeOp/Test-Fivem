const { Client, GatewayIntentBits, ActivityType, MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config();
const { handleWhitelistApplication } = require('./functions/whitelist');

const client = new Client({
  intents: Object.values(GatewayIntentBits),
});

const prefix = '!';

client.commands = new Map();

const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.on('messageCreate', (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);

  if (command) {
    try {
      command.execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply('There was an error trying to execute that command!');
    }
  }
});

const app = express();
const port = 3000;
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  res.sendFile(indexPath);
});
app.listen(port, () => {
  console.log(`🔗 Listening to GlaceYT : http://localhost:${port}`);
});

async function login() {
  try {
    await client.login(process.env.TOKEN);
    console.log('\x1b[32m%s\x1b[0m', '|    🍔 Bot logged in successfully!');
    console.log('\x1b[36m%s\x1b[0m', '|    🚀 Commands Loaded successfully!');
    console.log('\x1b[32m%s\x1b[0m', `|    🌼 Logged in as ${client.user.username}`);
    console.log('\x1b[36m%s\x1b[0m', `|    🏡 Bot is in ${client.guilds.cache.size} servers`);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Failed to log in:', error);
    console.log('\x1b[31m%s\x1b[0m', '❌ Client Not Login, Restarting Process...');
    process.kill(1);
  }
}

client.once('ready', () => {
  setTimeout(() => {
    console.log('\x1b[32m%s\x1b[0m', `|    🎯 Activity sucessfully set!`);
    client.user.setPresence({
      activities: [{ name: `Watching You !`, type: ActivityType.Custom }],
      status: 'dnd',
    });
  }, 2000);
});

client.on('messageCreate', (message) => {
  handleWhitelistApplication(client, message);
});

login();

setInterval(() => {
  if (!client || !client.user) {
    console.log('\x1b[31m%s\x1b[0m', '❌ Client Not Logged in, Restarting Process...');
    process.kill(1);
  }
}, 15000);

module.exports = client;
