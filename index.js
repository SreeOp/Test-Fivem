require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel], // Required to receive DMs
});

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  
  const { sendApplicationEmbed } = require('./functions/apply');
  await sendApplicationEmbed(client);
});

client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId === 'applyButton') {
      const { handleApplicationButton } = require('./functions/apply');
      await handleApplicationButton(interaction);
    } else if (interaction.customId === 'acceptButton' || interaction.customId === 'rejectButton' || interaction.customId === 'pendingButton') {
      const { handleApplicationDecision } = require('./functions/handleApplication');
      await handleApplicationDecision(interaction);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
