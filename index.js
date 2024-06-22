const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionType, REST, Routes, ChannelType, PermissionsBitField } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages] });

client.commands = new Collection();
let ticketCategoryId = '';

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    const commands = [
        {
            name: 'setticketcategory',
            description: 'Set the category for ticket channels',
            options: [
                {
                    name: 'category',
                    type: 7, // Channel type
                    description: 'The category to create ticket channels in',
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

        if (commandName === 'setticketcategory') {
            const category = interaction.options.getChannel('category');
            if (category && category.type === ChannelType.GuildCategory) {
                ticketCategoryId = category.id;
                console.log(`Ticket category set to: ${ticketCategoryId}`);
                await interaction.reply({ content: `Ticket category has been set to ${category.name}`, ephemeral: true });

                // Send ticket creation button
                const embed = new EmbedBuilder()
                    .setTitle('Support Ticket')
                    .setDescription('Click the button below to create a new support ticket.');

                const button = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('create_ticket')
                        .setLabel('Create Ticket')
                        .setStyle(ButtonStyle.Primary)
                );

                await category.guild.systemChannel.send({ embeds: [embed], components: [button] });
            } else {
                console.log('Category not found or invalid.');
                await interaction.reply({ content: 'Failed to find or access the specified category.', ephemeral: true });
            }
        }
    } else if (interaction.isButton()) {
        const handleButtonInteraction = require('./functions/handleButtonInteraction');
        await handleButtonInteraction(interaction, ticketCategoryId);
    } else if (interaction.type === InteractionType.ModalSubmit) {
        // Handle modal submissions if needed
    }
});

client.login(process.env.DISCORD_TOKEN);
