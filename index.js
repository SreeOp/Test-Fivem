const { Client, GatewayIntentBits, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

let submittedChannelId = null;
let roleConfig = {
  accepted: null,
  pending: null,
  rejected: null,
};

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'setapplication') {
    await interaction.reply('Application channel set!');
  } else if (commandName === 'setsubmitted') {
    submittedChannelId = interaction.channel.id;
    await interaction.reply('Submitted channel set!');
  } else if (commandName === 'setrole') {
    const status = interaction.options.getString('status');
    const role = interaction.options.getRole('role');
    if (status && role) {
      roleConfig[status] = role.id;
      await interaction.reply(`Role for ${status} set to ${role.name}`);
    } else {
      await interaction.reply('Invalid status or role');
    }
  } else if (commandName === 'postapplication') {
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('apply')
          .setLabel('Apply')
          .setStyle(ButtonStyle.Primary),
      );

    await interaction.reply({ content: 'Click the button to apply for the whitelist.', components: [row] });
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'apply') {
    const user = interaction.user;

    // Embed message
    const embed = new EmbedBuilder()
      .setTitle('Whitelist Application')
      .setDescription('Please fill out the following application:')
      .addFields(
        { name: 'Character Name', value: 'Your character name' },
        { name: 'Character Gender', value: 'The gender of your character' },
        { name: 'Real Name', value: 'Your real name' },
        { name: 'Age', value: 'Your real age' },
        { name: 'Roleplay Experience', value: 'Your role experience in months' },
      )
      .setFooter({ text: 'This form will be submitted to Unity Verse. Do not share passwords or other sensitive information.' });

    await user.send({ embeds: [embed] });
    await interaction.reply({ content: 'Application form sent to your DMs!', ephemeral: true });
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const userId = interaction.customId.split('-')[1];
  const user = await client.users.fetch(userId);

  if (!user) {
    await interaction.reply('User not found.');
    return;
  }

  const status = interaction.customId.split('-')[0];
  const role = roleConfig[status];

  if (role) {
    const guild = interaction.guild;
    const member = await guild.members.fetch(userId);
    await member.roles.add(role);
  }

  const embed = new EmbedBuilder()
    .setTitle(`Application ${status.charAt(0).toUpperCase() + status.slice(1)}`)
    .setDescription(`Your application status is now ${status}.`)
    .setImage('https://cdn.discordapp.com/attachments/1056903195961610275/1254445277759148172/096ff227-e675-4307-a969-e2aac7a4c7ba-2.png?ex=667a2d74&is=6678dbf4&hm=6213bc71f9d657d904a577e054f8d4d86e342df27350037fe63b78e8ce9dda7e');

  await user.send({ embeds: [embed] });
  await interaction.deferUpdate();
});

client.login(token);
