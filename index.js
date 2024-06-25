// Import necessary modules
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Routes, REST, TextInputBuilder, ModalBuilder, TextInputStyle } = require('discord.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Set the port from environment variables or default to 3000

// Load environment variables
require('dotenv').config();
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const acceptedChannelId = process.env.ACCEPTED_CHANNEL_ID; // Channel ID for accepted applications
const pendingChannelId = process.env.PENDING_CHANNEL_ID; // Channel ID for pending applications
const rejectedChannelId = process.env.REJECTED_CHANNEL_ID; // Channel ID for rejected applications
const reviewChannelId = process.env.REVIEW_CHANNEL_ID; // Channel ID for review (applications) channel

// Create a new Discord client
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

// When the bot is ready, log a message to indicate it
client.once('ready', () => {
    console.log('Bot is online!');
});

// Define application slash commands
const commands = [
    {
        name: 'setapplication',
        description: 'Set the channel for whitelist applications',
    },
    {
        name: 'postapplication',
        description: 'Post the application embed message in the application channel',
    }
];

// Set up REST for API requests
const rest = new REST({ version: '10' }).setToken(token);

// Register slash commands on startup
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

// Handle interactions (slash commands, buttons, modals)
client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
        // Handle slash commands
        if (interaction.commandName === 'setapplication') {
            // Set the application channel ID based on where the command was used
            applicationChannelId = interaction.channel.id;
            await interaction.reply('This channel has been set for whitelist applications.');
            console.log(`Application channel set to ${applicationChannelId}`);
        } else if (interaction.commandName === 'postapplication' && applicationChannelId) {
            // Post the application embed message in the specified application channel
            await interaction.deferReply({ ephemeral: true });

            // Create embed message for application
            const embed = new EmbedBuilder()
                .setTitle('Whitelist Application')
                .setDescription('Click the button below to apply for the whitelist.')
                .setColor('#00ff00')
                .setImage('https://cdn.discordapp.com/attachments/1056903195961610275/1254445277759148172/096ff227-e675-4307-a969-e2aac7a4c7ba-2.png?ex=667984b4&is=66783334&hm=0a486fb3dd9f322232f005efc1ebb1ce88e32eef1469278307d11a8c4aef7571&'); // Replace with your image URL

            // Create apply button
            const applyButton = new ButtonBuilder()
                .setCustomId('applyButton')
                .setLabel('Apply')
                .setStyle(ButtonStyle.Primary);

            // Create action row with apply button
            const row = new ActionRowBuilder()
                .addComponents(applyButton);

            // Send embed message with apply button to the application channel
            const channel = client.channels.cache.get(applicationChannelId);
            if (channel) {
                await channel.send({ embeds: [embed], components: [row] });
                await interaction.deleteReply(); // Delete the original reply
            } else {
                await interaction.editReply('Application channel is not set.');
            }
        }
    } else if (interaction.isButton()) {
        // Handle button interactions
        if (interaction.customId === 'applyButton') {
            // Show modal for whitelist application form
            const modal = new ModalBuilder()
                .setCustomId('applicationModal')
                .setTitle('Whitelist Application');

            // Add text input fields for application form
            const characterNameInput = new TextInputBuilder()
                .setCustomId('characterName')
                .setLabel('Character Name')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const characterGenderInput = new TextInputBuilder()
                .setCustomId('characterGender')
                .setLabel('Character Gender')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const realNameInput = new TextInputBuilder()
                .setCustomId('realName')
                .setLabel('Real Name')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const ageInput = new TextInputBuilder()
                .setCustomId('age')
                .setLabel('Age')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const experienceInput = new TextInputBuilder()
                .setCustomId('experience')
                .setLabel('Roleplay Experience')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            // Add action rows for each input field
            const row1 = new ActionRowBuilder().addComponents(characterNameInput);
            const row2 = new ActionRowBuilder().addComponents(characterGenderInput);
            const row3 = new ActionRowBuilder().addComponents(realNameInput);
            const row4 = new ActionRowBuilder().addComponents(ageInput);
            const row5 = new ActionRowBuilder().addComponents(experienceInput);

            // Add components to the modal
            modal.addComponents(row1, row2, row3, row4, row5);

            // Show the modal for the application form
            await interaction.showModal(modal);
        } else if (interaction.customId === 'acceptButton' || interaction.customId === 'pendingButton' || interaction.customId === 'rejectButton') {
            // Handle accept, pending, reject button interactions
            const userTag = interaction.message.embeds[0].description.split(' ')[2]; // Extract user tag from embed description
            const member = interaction.guild.members.cache.find(member => member.user.tag === userTag); // Find member by user tag

            if (member) {
                let embed;
                let roleID;
                let channelID;

                // Determine action based on button clicked
                if (interaction.customId === 'acceptButton') {
                    embed = new EmbedBuilder()
                        .setTitle('Application Update')
                        .setDescription('Your application status: Accepted')
                        .setColor('#00ff00')
                        .setImage('https://cdn.discordapp.com/attachments/1056903195961610275/1254445277759148172/096ff227-e675-4307-a969-e2aac7a4c7ba-2.png?ex=667984b4&is=66783334&hm=0a486fb3dd9f322232f005efc1ebb1ce88e32eef1469278307d11a8c4aef7571&'); // Replace with your accept image URL
                    roleID = '1253347204601741342'; // Replace with your accepted role ID
                    channelID = acceptedChannelId; // Replace with your accepted applications channel ID
                } else if (interaction.customId === 'pendingButton') {
                    embed = new EmbedBuilder()
                        .setTitle('Application Update')
                        .setDescription('Your application status: Pending')
                        .setColor('#ffff00')
                        .setImage('https://cdn.discordapp.com/attachments/1056903195961610275/1254445277759148172/096ff227-e675-4307-a969-e2aac7a4c7ba-2.png?ex=667984b4&is=66783334&hm=0a486fb3dd9f322232f005efc1ebb1ce88e32eef1469278307d11a8c4aef7571&'); // Replace with your pending image URL
                    roleID = '1253347271718735882'; // Replace with your pending role ID
                    channelID = pendingChannelId; // Replace with your pending applications channel ID
                } else if (interaction.customId === 'rejectButton') {
                    embed = new EmbedBuilder()
                        .setTitle('Application Update')
                        .setDescription('Your application status: Rejected')
                        .setColor('#ff0000')
                        .setImage('https://cdn.discordapp.com/attachments/1056903195961610275/1254445277759148172/096ff227-e675-4307-a969-e2aac7a4c7ba-2.png?ex=667984b4&is=66783334&hm=0a486fb3dd9f322232f005efc1ebb1ce88e32eef1469278307d11a8c4aef7571&'); // Replace with your reject image URL
                    roleID = '1254774082445115432'; // Replace with your rejected role ID
                    channelID = rejectedChannelId; // Replace with your rejected applications channel ID
                }

                try {
                    // Add role to member
                    await member.roles.add(roleID);
                    
                    // Update member via DM
                    await member.send({ embeds: [embed] });

                    // Update interaction reply with application status
                    const updateEmbed = new EmbedBuilder()
                        .setTitle('Application Status Updated')
                        .setDescription(`The application for ${member.user.tag} has been updated.`)
                        .setColor(embed.data.color);

                    await interaction.update({ embeds: [updateEmbed], components: [] });

                    // Notify corresponding channel
                    const channel = client.channels.cache.get(channelID);
                    if (channel) {
                        await channel.send({ embeds: [embed] });
                    }
                } catch (error) {
                    console.error('Error updating application status:', error);
                    await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
                }
            }
        }
    } else if (interaction.isModalSubmit()) {
        // Handle modal form submission
        if (interaction.customId === 'applicationModal') {
            // Handle application form submission
            const characterName = interaction.values.find(v => v.customId === 'characterName').value;
            const characterGender = interaction.values.find(v => v.customId === 'characterGender').value;
            const realName = interaction.values.find(v => v.customId === 'realName').value;
            const age = interaction.values.find(v => v.customId === 'age').value;
            const experience = interaction.values.find(v => v.customId === 'experience').value;

            // Example: Save application to database, send to review channel, etc.
            const reviewChannel = client.channels.cache.get(reviewChannelId);
            if (reviewChannel) {
                const reviewEmbed = new EmbedBuilder()
                    .setTitle('New Whitelist Application')
                    .addField('Character Name', characterName, true)
                    .addField('Character Gender', characterGender, true)
                    .addField('Real Name', realName, true)
                    .addField('Age', age, true)
                    .addField('Roleplay Experience', experience)
                    .setColor('#00ff00');

                await reviewChannel.send({ embeds: [reviewEmbed] });

                await interaction.reply('Your application has been submitted for review. We will get back to you soon.');
            } else {
                await interaction.reply('Application review channel is not set.');
            }
        }
    }
});

// Log in to Discord with your app's token
client.login(token);

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
