const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, REST, Routes } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages] });

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
        const { commandName } = interaction;

        if (commandName === 'setapplication') {
            const channel = interaction.options.getChannel('channel');
            if (channel) {
                applicationChannelId = channel.id;
                const embed = new EmbedBuilder()
                    .setTitle('Whitelist Application')
                    .setDescription('Apply here for Whitelist\n\n🟢 **Interview:**\nWhitelist Interviews are available 24x7\n\n🟢 **Availability:**\nWe are usually always available between peak times - 06:00 PM to 08:00 PM.\n\n**NOTE:**\nCheck the rules before applying')
                    .setImage('attachment://image.jpg');

                const buttons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('apply_whitelist')
                        .setLabel('Apply For Whitelist')
                        .setStyle(ButtonStyle.Primary)
                );

                console.log(`Sending embed to channel ${channel.id}`);
                try {
                    await channel.send({ embeds: [embed], components: [buttons] });
                    await interaction.reply({ content: `Application form has been sent to ${channel}`, ephemeral: true });
                } catch (error) {
                    console.error('Failed to send message to channel:', error);
                    await interaction.reply({ content: 'Failed to send message to the specified channel.', ephemeral: true });
                }
            } else {
                console.log('Channel not found or invalid.');
                await interaction.reply({ content: 'Failed to find or access the specified channel.', ephemeral: true });
            }
        } else if (commandName === 'setsubmissions') {
            const channel = interaction.options.getChannel('channel');
            if (channel) {
                applicationSubmissionChannelId = channel.id;
                await interaction.reply({ content: `Submission channel has been set to ${channel}`, ephemeral: true });
            } else {
                console.log('Channel not found or invalid.');
                await interaction.reply({ content: 'Failed to find or access the specified channel.', ephemeral: true });
            }
        }
    } else if (interaction.isButton()) {
        // Handle button interactions
    } else if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'whitelist_application') {
        // Handle modal submissions
    }
});

client.login(process.env.DISCORD_TOKEN);
