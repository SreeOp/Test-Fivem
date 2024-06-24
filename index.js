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

// Load the saved application review channel ID
const reviewChannelFilePath = path.resolve(__dirname, 'applicationReviewChannelId.txt');
if (fs.existsSync(reviewChannelFilePath)) {
    applicationReviewChannelId = fs.readFileSync(reviewChannelFilePath, 'utf8');
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

            if (applicationReviewChannelId) {
                const reviewChannel = client.channels.cache.get(applicationReviewChannelId);
                if (reviewChannel) {
                    await reviewChannel.send({ content: `<@${interaction.user.id}>`, embeds: [applicationEmbed], components: [row] });
                    await m.reply('Your application has been submitted.');
                } else {
                    await m.reply('Application review channel is not set.');
                }
            } else {
                await m.reply('Application review channel is not set.');
            }
        });
    } else if (interaction.customId === 'acceptButton' || interaction.customId === 'pendingButton' || interaction.customId === 'rejectButton') {
        const userTag = interaction.message.embeds[0].description.split(' ')[2];
        const member = interaction.guild.members.cache.find(member => member.user.tag === userTag);

        if (member) {
            let embed;
            if (interaction.customId === 'acceptButton') {
                embed = new EmbedBuilder()
                    .setTitle('Application Update')
                    .setDescription('Your application status: Accepted')
                    .setColor('#00ff00')
                    .setImage('URL_TO_ACCEPT_IMAGE'); // Replace with your image URL
                const role = interaction.guild.roles.cache.find(r => r.name === 'Whitelisted');
                if (role) member.roles.add(role);
            } else if (interaction.customId === 'pendingButton') {
                embed = new EmbedBuilder()
                    .setTitle('Application Update')
                    .setDescription('Your application status: Pending')
                    .setColor('#ffff00')
                    .setImage('URL_TO_PENDING_IMAGE'); // Replace with your image URL
            } else if (interaction.customId === 'rejectButton') {
                embed = new EmbedBuilder()
                    .setTitle('Application Update')
                    .setDescription('Your application status: Rejected')
                    .setColor('#ff0000')
                    .setImage('URL_TO_REJECT_IMAGE'); // Replace with your image URL
            }
            await member.send({ embeds: [embed] });
            await interaction.deferUpdate();
        } else {
            await interaction.reply('User not found.');
        }
    }
});

client.login(token);
