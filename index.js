require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageReactionAdd,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const functionFiles = fs.readdirSync('./functions').filter(file => file.endsWith('.js'));

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  
  const { sendApplicationEmbed } = require('./functions/apply');
  await sendApplicationEmbed(client);
});

client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId === 'applyButton') {
      const { handleApplicationButton } = require('./functions/apply');
      await handleApplicationButton(interaction);
    } else if (interaction.customId === 'acceptButton' || interaction.customId === 'rejectButton') {
      const { handleApplicationDecision } = require('./functions/handleApplication');
      await handleApplicationDecision(interaction);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
