const { 
    Client, 
    GatewayIntentBits, 
    Collection, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    InteractionType, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    REST, 
    Routes 
} = require('discord.js');
require('dotenv').config();

const handleApplicationCommand = require('./functions/handleApplicationCommand');
const handleSubmissionCommand = require('./functions/handleSubmissionCommand');
const handleButtonInteraction = require('./functions/handleButtonInteraction');
const handleModalSubmit = require('./functions/handleModalSubmit');

const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent, 
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers 
] });

client.commands = new Collection();
let applicationChannelId = '';
let applicationSubmissionChannelId = '';

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    const commands = [
        {
            name: 'setapplication',
            description: 'Set the application channel',
            options: [
                {
                    name: 'channel',
                    type: 7, // Channel type
                    description: 'The channel to send the application form',
                    required: true
                }
            ]
        },
        {
            name: 'setsubmissions',
            description: 'Set the submissions channel',
            options: [
                {
                    name: 'channel',
                    type: 7, // Channel type
                    description: 'The channel to receive submitted applications',
                    required: true
                }
            ]
        }
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('Successfully registered application commands.');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'setapplication') {
            await handleApplicationCommand(interaction, applicationChannelId);
        } else if (interaction.commandName === 'setsubmissions') {
            await handleSubmissionCommand(interaction, applicationSubmissionChannelId);
        }
    } else if (interaction.isButton()) {
        await handleButtonInteraction(interaction);
    } else if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'whitelist_application') {
        await handleModalSubmit(interaction, applicationSubmissionChannelId);
    }
});

client.login(process.env.DISCORD_TOKEN);
