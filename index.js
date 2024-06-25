require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Routes, REST, TextInputBuilder, ModalBuilder, TextInputStyle } = require('discord.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Set the port from environment variables or default to 3000

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const acceptedChannelId = process.env.ACCEPTED_CHANNEL_ID; // Channel ID for accepted applications
const pendingChannelId = process.env.PENDING_CHANNEL_ID; // Channel ID for pending applications
const rejectedChannelId = process.env.REJECTED_CHANNEL_ID; // Channel ID for rejected applications
const reviewChannelId = process.env.REVIEW_CHANNEL_ID; // Channel ID for review of applications

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

client.once('ready', () => {
    console.log('Bot is online!');
});

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
    if (!interaction.isCommand() && !interaction.isButton() && !interaction.isModalSubmit()) return;

    if (interaction.isCommand()) {
        const { commandName } = interaction;

        if (commandName === 'setapplication') {
            applicationChannelId = interaction.channelId;
            await interaction.reply('This channel has been set for whitelist applications.');
            console.log(`Application channel set to ${applicationChannelId}`);
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
        }
    } else if (interaction.isButton()) {
        if (interaction.customId === 'applyButton') {
            const modal = new ModalBuilder()
                .setCustomId('applicationModal')
                .setTitle('Whitelist Application');

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

            const row1 = new ActionRowBuilder().addComponents(characterNameInput);
            const row2 = new ActionRowBuilder().addComponents(characterGenderInput);
            const row3 = new ActionRowBuilder().addComponents(realNameInput);
            const row4 = new ActionRowBuilder().addComponents(ageInput);
            const row5 = new ActionRowBuilder().addComponents(experienceInput);

            modal.addComponents(row1, row2, row3, row4, row5);

            await interaction.reply({ content: 'Please fill out the following information:', components: [modal] });
        } else if (interaction.customId === 'acceptButton' || interaction.customId === 'pendingButton' || interaction.customId === 'rejectButton') {
            const userTag = interaction.message.embeds[0].description.split(' ')[2];
            const member = interaction.guild.members.cache.find(member => member.user.tag === userTag);

            if (member) {
                let embed;
                let roleID;
                let channelID;

                if (interaction.customId === 'acceptButton') {
                    embed = new EmbedBuilder()
                        .setTitle('Application Update')
                        .setDescription('Your application status: Accepted')
                        .setColor('#00ff00')
                        .setImage('https://cdn.discordapp.com/attachments/1056903195961610275/1254445277759148172/096ff227-e675-4307-a969-e2aac7a4c7ba-2.png?ex=667984b4&is=66783334&hm=0a486fb3dd9f322232f005efc1ebb1ce88e32eef1469278307d11a8c4aef7571&'); // Replace with your accept image URL
                    roleID = '1253347204601741342'; // Replace with your role ID for accepted applications
                    channelID = acceptedChannelId; // Channel ID for accepted applications
                } else if (interaction.customId === 'pendingButton') {
                    embed = new EmbedBuilder()
                        .setTitle('Application Update')
                        .setDescription('Your application status: Pending')
                        .setColor('#ffff00')
                        .setImage('https://cdn.discordapp.com/attachments/1056903195961610275/1254445277759148172/096ff227-e675-4307-a969-e2aac7a4c7ba-2.png?ex=667984b4&is=66783334&hm=0a486fb3dd9f322232f005efc1ebb1ce88e32eef1469278307d11a8c4aef7571&'); // Replace with your pending image URL
                    roleID = '1253347271718735882'; // Replace with your role ID for pending applications
                    channelID = pendingChannelId; // Channel ID for pending applications
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
            const characterNameInput = interaction.values.find(v => v.customId === 'characterName');
            const characterGenderInput = interaction.values.find(v => v.customId === 'characterGender');
            const realNameInput = interaction.values.find(v => v.customId === 'realName');
            const ageInput = interaction.values.find(v => v.customId === 'age');
            const experienceInput = interaction.values.find(v => v.customId === 'experience');

            if (characterNameInput && characterGenderInput && realNameInput && ageInput && experienceInput) {
                const characterName = characterNameInput.value;
                const characterGender = characterGenderInput.value;
                const realName = realNameInput.value;
                const age = ageInput.value;
                const experience = experienceInput.value;

                // Example: Save application to database, send to review channel, etc.
                const reviewChannel = client.channels.cache.get(reviewChannelId);
                if (reviewChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle('New Whitelist Application')
                        .setDescription(`**Applicant:** ${interaction.user.tag}\n\n**Character Name:** ${characterName}\n**Character Gender:** ${characterGender}\n**Real Name:** ${realName}\n**Age:** ${age}\n**Roleplay Experience:** ${experience}`)
                        .setColor('#0000ff');

                    await reviewChannel.send({ embeds: [embed] });

                    await interaction.reply({
                        content: 'Thank you for your whitelist application. We\'ll review it and be in touch.',
                        ephemeral: true
                    });
                } else {
                    console.error('Review channel not found.');
                    await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
                }
            } else {
                console.error('One or more inputs are missing or undefined.');
                await interaction.reply({ content: 'There was an issue processing your application. Please try again.', ephemeral: true });
            }
        }
    }
});

// Express server
app.get('/', (req, res) => {
    res.send('Bot is running.');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

client.login(token).catch(console.error);
