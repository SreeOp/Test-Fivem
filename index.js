require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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

const token = process.env.TOKEN;

let applicationChannelId = null;
let applicationReviewChannelId = null;

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
    if (message.content.startsWith('/setapplication')) {
        applicationChannelId = message.channel.id;
        message.channel.send('This channel has been set for whitelist applications.');
    } else if (message.content.startsWith('/setsubmitted')) {
        applicationReviewChannelId = message.channel.id;
        message.channel.send('This channel has been set for reviewing submitted applications.');
    } else if (message.content.startsWith('/postapplication') && applicationChannelId) {
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

        client.channels.cache.get(applicationChannelId).send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'applyButton') {
        await interaction.reply({ content: 'Please fill out the application form.', ephemeral: true });

        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 60000, max: 1 });

        collector.on('collect', m => {
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
                client.channels.cache.get(applicationReviewChannelId).send({ embeds: [applicationEmbed], components: [row] });
                m.reply('Your application has been submitted.');
            } else {
                m.reply('Application review channel is not set.');
            }
        });
    } else if (interaction.customId === 'acceptButton' || interaction.customId === 'pendingButton' || interaction.customId === 'rejectButton') {
        const user = interaction.message.embeds[0].description.split(' ')[2];
        const member = interaction.guild.members.cache.find(member => member.user.tag === user);

        if (interaction.customId === 'acceptButton') {
            member.send('Your application has been accepted!');
            const role = interaction.guild.roles.cache.find(r => r.name === 'Whitelisted');
            if (role) member.roles.add(role);
        } else if (interaction.customId === 'pendingButton') {
            member.send('Your application is pending.');
        } else if (interaction.customId === 'rejectButton') {
            member.send('Your application has been rejected.');
        }

        interaction.deferUpdate();
    }
});

client.login(token);
