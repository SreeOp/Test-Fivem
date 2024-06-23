require('dotenv').config();
const { Client, Intents, MessageEmbed } = require('discord.js');
const { MessageButton, MessageActionRow } = require('discord-buttons');
const client = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES, 
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ] 
});
require('discord-buttons')(client);

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
            .setStyle('blurple')
            .setLabel('Apply')
            .setID('applyButton');

        const row = new MessageActionRow()
            .addComponent(applyButton);

        client.channels.cache.get(applicationChannelId).send({ embeds: [embed], components: [row] });
    }
});

client.on('clickButton', async (button) => {
    if (button.id === 'applyButton') {
        await button.reply.send('Please fill out the application form.', true);
        const filter = m => m.author.id === button.clicker.user.id;
        const collector = button.channel.createMessageCollector({ filter, time: 60000, max: 1 });

        collector.on('collect', m => {
            const applicationEmbed = new MessageEmbed()
                .setTitle('New Whitelist Application')
                .setDescription(`Application from ${button.clicker.user.tag}`)
                .addField('Application Content', m.content)
                .setColor('#00ff00');

            const acceptButton = new MessageButton()
                .setStyle('green')
                .setLabel('Accept')
                .setID('acceptButton');

            const pendingButton = new MessageButton()
                .setStyle('grey')
                .setLabel('Pending')
                .setID('pendingButton');

            const rejectButton = new MessageButton()
                .setStyle('red')
                .setLabel('Reject')
                .setID('rejectButton');

            const row = new MessageActionRow()
                .addComponent(acceptButton)
                .addComponent(pendingButton)
                .addComponent(rejectButton);

            if (applicationReviewChannelId) {
                client.channels.cache.get(applicationReviewChannelId).send({ embeds: [applicationEmbed], components: [row] })
                    .then(sentMessage => {
                        sentMessage.react('👍');
                    });

                m.reply('Your application has been submitted.');
            } else {
                m.reply('Application review channel is not set.');
            }
        });
    } else if (button.id === 'acceptButton' || button.id === 'pendingButton' || button.id === 'rejectButton') {
        const user = button.message.embeds[0].description.split(' ')[2];
        const member = button.guild.members.cache.find(member => member.user.tag === user);

        if (button.id === 'acceptButton') {
            member.send('Your application has been accepted!');
            const role = button.guild.roles.cache.find(r => r.name === 'Whitelisted');
            if (role) member.roles.add(role);
        } else if (button.id === 'pendingButton') {
            member.send('Your application is pending.');
        } else if (button.id === 'rejectButton') {
            member.send('Your application has been rejected.');
        }

        button.reply.defer();
    }
});

client.login(token);
