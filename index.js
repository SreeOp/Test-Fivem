require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Routes, REST } = require('discord.js');
const fs = require('fs');
const path = require('path');
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

let applicationChannelId = null;
let applicationReviewChannelId = null;

let acceptRoleId = null;
let pendingRoleId = null;
let rejectRoleId = null;

// Load the saved application review channel ID and role IDs
const reviewChannelFilePath = path.resolve(__dirname, 'applicationReviewChannelId.txt');
const rolesFilePath = path.resolve(__dirname, 'roles.json');

if (fs.existsSync(reviewChannelFilePath)) {
    applicationReviewChannelId = fs.readFileSync(reviewChannelFilePath, 'utf8');
}

if (fs.existsSync(rolesFilePath)) {
    const roles = JSON.parse(fs.readFileSync(rolesFilePath, 'utf8'));
    acceptRoleId = roles.acceptRoleId;
    pendingRoleId = roles.pendingRoleId;
    rejectRoleId = roles.rejectRoleId;
}

client.once('ready', () => {
    console.log('Bot is online!');
});

const commands = [
    {
        name: 'setapplication',
        description: 'Set the channel for whitelist applications',
    },
    {
        name: 'setsubmitted',
        description: 'Set the channel for reviewing submitted applications',
    },
    {
        name: 'postapplication',
        description: 'Post the application embed message in the application channel',
    },
    {
        name: 'setacceptrole',
        description: 'Set the role for accepted applications',
        options: [
            {
                name: 'role',
                type: 'ROLE',
                description: 'The role to assign for accepted applications',
                required: true,
            },
        ],
    },
    {
        name: 'setpendingrole',
        description: 'Set the role for pending applications',
        options: [
            {
                name: 'role',
                type: 'ROLE',
                description: 'The role to assign for pending applications',
                required: true,
            },
        ],
    },
    {
        name: 'setrejectrole',
        description: 'Set the role for rejected applications',
        options: [
            {
                name: 'role',
                type: 'ROLE',
                description: 'The role to assign for rejected applications',
                required: true,
            },
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error refreshing application (/) commands:', error);
    }
})();

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'setapplication') {
        applicationChannelId = interaction.channel.id;
        await interaction.reply('This channel has been set for whitelist applications.');
        console.log(`Application channel set to ${applicationChannelId}`);
    } else if (commandName === 'setsubmitted') {
        applicationReviewChannelId = interaction.channel.id;
        fs.writeFileSync(reviewChannelFilePath, applicationReviewChannelId);
        await interaction.reply('This channel has been set for reviewing submitted applications.');
        console.log(`Application review channel set to ${applicationReviewChannelId}`);
    } else if (commandName === 'postapplication' && applicationChannelId) {
        await interaction.deferReply({ ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle('Whitelist Application')
            .setDescription('Click the button below to apply for the whitelist.')
            .setColor('#00ff00');

        const applyButton = new ButtonBuilder()
            .setCustomId('applyButton')
            .setLabel('Apply')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .addComponents(applyButton);

        const channel = client.channels.cache.get(applicationChannelId);
        if (channel) {
            await channel.send({ embeds: [embed], components: [row] });
            await interaction.deleteReply();
        } else {
            await interaction.editReply('Application channel is not set.');
        }
    } else if (commandName === 'setacceptrole') {
        acceptRoleId = options.getRole('role').id;
        await interaction.reply(`Role for accepted applications set to <@&${acceptRoleId}>.`);
        saveRoles();
    } else if (commandName === 'setpendingrole') {
        pendingRoleId = options.getRole('role').id;
        await interaction.reply(`Role for pending applications set to <@&${pendingRoleId}>.`);
        saveRoles();
    } else if (commandName === 'setrejectrole') {
        rejectRoleId = options.getRole('role').id;
        await interaction.reply(`Role for rejected applications set to <@&${rejectRoleId}>.`);
        saveRoles();
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'applyButton') {
        await interaction.reply({ content: 'Please fill out the application form.', ephemeral: true });

        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 60000, max: 1 });

        collector.on('collect', async m => {
            const applicationEmbed = new EmbedBuilder()
                .setTitle('New Whitelist Application')
                .setDescription(`Application from ${interaction.user.tag}`)
                .addFields([{ name: 'Application Content', value: m.content }])
                .setColor('#00ff00');

            const acceptButton = new ButtonBuilder()
