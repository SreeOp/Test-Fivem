require('dotenv').config();
const { Client, Intents, MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES]
});

let submittedChannelId = null;
let roles = {
    accepted: null,
    pending: null,
    rejected: null
};

const commands = [
    {
        name: 'setapplication',
        description: 'Set the channel for whitelist applications'
    },
    {
        name: 'setsubmitted',
        description: 'Set the channel for submitted applications'
    },
    {
        name: 'setrole',
        description: 'Set roles for accepted, pending, and rejected applications',
        options: [
            {
                name: 'accepted',
                description: 'Role for accepted applications',
                type: 'ROLE',
                required: true
            },
            {
                name: 'pending',
                description: 'Role for pending applications',
                type: 'ROLE',
                required: true
            },
            {
                name: 'rejected',
                description: 'Role for rejected applications',
                type: 'ROLE',
                required: true
            }
        ]
    },
    {
        name: 'postapplication',
        description: 'Post the application form'
    }
];

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
        console.log('Successfully registered application commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() && !interaction.isButton()) return;

    if (interaction.isCommand()) {
        if (interaction.commandName === 'setapplication') {
            const channel = interaction.channel;
            await channel.send({
                content: 'Whitelist Application',
                components: [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setCustomId('apply')
                            .setLabel('Apply')
                            .setStyle('PRIMARY')
                    )
                ]
            });
            await interaction.reply('Application form has been set.');
        }

        if (interaction.commandName === 'setsubmitted') {
            submittedChannelId = interaction.channelId;
            await interaction.reply('Submitted applications channel has been set.');
        }

        if (interaction.commandName === 'setrole') {
            roles.accepted = interaction.options.getRole('accepted').id;
            roles.pending = interaction.options.getRole('pending').id;
            roles.rejected = interaction.options.getRole('rejected').id;
            await interaction.reply('Roles have been set.');
        }

        if (interaction.commandName === 'postapplication') {
            if (!submittedChannelId) {
                await interaction.reply('Submitted channel is not set. Use /setsubmitted command first.');
                return;
            }

            const embed = new MessageEmbed()
                .setTitle('Whitelist Application')
                .setDescription('Click the button below to apply for whitelist.')
                .setColor('#00FF00');

            await interaction.channel.send({
                embeds: [embed],
                components: [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setCustomId('apply')
                            .setLabel('Apply')
                            .setStyle('PRIMARY')
                    )
                ]
            });

            await interaction.reply('Application form has been posted.');
        }
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'apply') {
            const modalEmbed = new MessageEmbed()
                .setTitle('Whitelist Application')
                .setDescription('Please fill out the following details.')
                .addField('Character Name', 'Your character name')
                .addField('Character Gender', 'The gender of your character')
                .addField('Real Name', 'Your real name')
                .addField('Age', 'Your real age')
                .addField('Roleplay Experience', 'Your role experience in months')
                .setColor('#0000FF')
                .setFooter('This form will be submitted to Unity Verse. Do not share passwords or other sensitive information.');

            await interaction.user.send({ embeds: [modalEmbed] });
            await interaction.reply({ content: 'Please check your DMs for the application form.', ephemeral: true });
