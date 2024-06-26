require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Routes, REST } = require('discord.js');
const express = require('express');
const fs = require('fs');
const path = require('path');

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const acceptedChannelId = process.env.ACCEPTED_CHANNEL_ID;
const pendingChannelId = process.env.PENDING_CHANNEL_ID;
const rejectedChannelId = process.env.REJECTED_CHANNEL_ID;
const applicationReviewChannelId = process.env.REVIEW_CHANNEL_ID;

const app = express();
const port = process.env.PORT || 3000;

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
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'setapplication') {
        applicationChannelId = interaction.channel.id;
        await interaction.reply('This channel has been set for whitelist applications.');
        console.log(`Application channel set to ${applicationChannelId}`);
    } else if (commandName === 'setsubmitted') {
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
                .setDescription(`Submitted by: ${interaction.user.tag}`)
                .addFields(
                    { name: 'Character Name', value: characterName, inline: true },
                    { name: 'Character Gender', value: characterGender, inline: true },
                    { name: 'Real Name', value: realName, inline: true },
                    { name: 'Age', value: age, inline: true },
                    { name: 'Roleplay Experience', value: experience, inline: true }
                )
                .setColor('#00ff00')
                .setTimestamp();

            const acceptButton = new ButtonBuilder()
                .setCustomId('acceptButton')
                .setLabel('Accept')
                .setStyle(ButtonStyle.Success);

            const pendingButton = new ButtonBuilder()
                .setCustomId('pendingButton')
                .setLabel('Pending')
                .setStyle(ButtonStyle.Secondary);

            const rejectButton = new ButtonBuilder()
                .setCustomId('rejectButton')
                .setLabel('Reject')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder()
                .addComponents(acceptButton, pendingButton, rejectButton);

            const channel = client.channels.cache.get(applicationReviewChannelId);
            if (channel) {
                await channel.send({ content: `<@${interaction.user.id}>`, embeds: [applicationEmbed], components: [row] }); // Mention the user in the review channel
            }

            await interaction.reply({ content: 'Application submitted successfully!', ephemeral: true });
        });
    } else if (interaction.customId === 'rejectButton') {
        await interaction.reply({ content: 'Please provide a reason for rejection:', ephemeral: true });

        const filter = response => response.author.id === interaction.user.id;
        const reasonCollector = interaction.channel.createMessageCollector({ filter, time: 60000, max: 1 });

        reasonCollector.on('collect', async reasonMessage => {
            const reason = reasonMessage.content;
            const userTag = interaction.message.embeds[0].description.split(' ')[2];
            const member = interaction.guild.members.cache.find(member => member.user.tag === userTag);

            if (member) {
                const rejectionEmbed = new EmbedBuilder()
                    .setTitle('Whitelist Application Rejected')
                    .setDescription('Read Rules & Re-Apply Whitelist')
                    .addFields(
                        { name: 'ID', value: `<@${member.id}>`, inline: true },
                        { name: 'TIME', value: `${new Date().toLocaleString()}`, inline: true },
                        { name: 'Reason', value: reason }
                    )
                    .setColor('#ff0000')
                    .setImage('https://media.discordapp.net/attachments/1056903195961610275/1254445277759148172/096ff227-e675-4307-a969-e2aac7a4c7ba-2.png?ex=667ad634&is=667984b4&hm=7cd86a2366c7c0b217ab3b83a21ad954c504a977f1fdc0d959912e0ef2346d90&=&format=webp&quality=lossless&width=544&height=192')
                    .setTimestamp();

                const channel = client.channels.cache.get(rejectedChannelId);
                if (channel) {
                    await channel.send({ content: `<@${member.id}>`, embeds: [rejectionEmbed] });
                }

                await interaction.followUp({ content: 'Rejection reason submitted successfully.', ephemeral: true });
            } else {
                await interaction.followUp({ content: 'User not found.', ephemeral: true });
            }
        });
    }
});

client.login(token);

// Set up an Express server
app.get('/', (req, res) => {
    res.send('Hello, this is your Discord bot running.');
});

app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
});
