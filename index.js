require('dotenv').config();
const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const client = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES, 
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'] 
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
        const embed = new MessageEmbed()
            .setTitle('Whitelist Application')
            .setDescription('Click the button below to apply for the whitelist.')
            .setColor('#00ff00');

        const applyButton = new MessageButton()
            .setCustomId('applyButton')
            .setLabel('Apply')
            .setStyle('PRIMARY');

        const row = new MessageActionRow()
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
            const applicationEmbed = new MessageEmbed()
                .setTitle('New Whitelist Application')
                .setDescription(`Application from ${interaction.user.tag}`)
                .addField('Application Content', m.content)
                .setColor('#00ff00');

            const acceptButton = new MessageButton()
                .setCustomId('acceptButton')
                .setLabel('Accept')
                .setStyle('SUCCESS');

            const pendingButton = new MessageButton()
                .setCustomId('pendingButton')
                .setLabel('Pending')
                .setStyle('SECONDARY');

            const rejectButton = new MessageButton()
                .setCustomId('rejectButton')
                .setLabel('Reject')
                .setStyle('DANGER');

            const row = new MessageActionRow()
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
