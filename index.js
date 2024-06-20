const Discord = require('discord.js');
const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS, // Required for guilds
        Discord.Intents.FLAGS.GUILD_MESSAGES, // Required for messages
        Discord.Intents.FLAGS.DIRECT_MESSAGES, // Required for DMs
        Discord.Intents.FLAGS.MESSAGE_REACTIONS // Required to handle button interactions
    ]
});
const { token, guildId, applicationChannelId, reviewChannelId } = require('./config.json');

client.once('ready', () => {
    console.log('Bot is ready!');
});

client.on('messageCreate', async message => {
    if (message.content.toLowerCase() === '!apply') {
        const embed = new Discord.MessageEmbed()
            .setTitle('Whitelist Application')
            .setDescription('Click the button below to apply for whitelist.')
            .setColor('#00ff00');

        const applicationChannel = client.channels.cache.get(applicationChannelId);
        if (!applicationChannel || applicationChannel.type !== 'GUILD_TEXT') return message.channel.send('Application channel not found.');

        const sentMessage = await applicationChannel.send({ embeds: [embed], components: [getApplyButton()] });

        client.on('interactionCreate', async interaction => {
            if (!interaction.isButton()) return;

            if (interaction.customId === 'apply') {
                const user = interaction.user;
                try {
                    await user.send('Your application has been submitted successfully.');
                } catch (error) {
                    console.error('Could not send DM to user.');
                }

                const reviewChannel = client.channels.cache.get(reviewChannelId);
                if (reviewChannel && reviewChannel.type === 'GUILD_TEXT') {
                    const reviewEmbed = new Discord.MessageEmbed()
                        .setTitle('New Whitelist Application')
                        .setDescription('Review and decide on this application.')
                        .setColor('#ffcc00')
                        .addField('Applicant', user.tag);

                    const reviewMessage = await reviewChannel.send({ embeds: [reviewEmbed], components: getReviewButtons(user) });
                    sentMessage.delete();
                }
            }
        });
    }
});

function getApplyButton() {
    return new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId('apply')
                .setLabel('Apply')
                .setStyle('SUCCESS')
        );
}

function getReviewButtons(user) {
    return new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId('accept')
                .setLabel('Accept')
                .setStyle('SUCCESS')
                .setEmoji('✅'),
            new Discord.MessageButton()
                .setCustomId('reject')
                .setLabel('Reject')
                .setStyle('DANGER')
                .setEmoji('❌'),
            new Discord.MessageButton()
                .setCustomId('pending')
                .setLabel('Pending')
                .setStyle('SECONDARY')
                .setEmoji('⌛')
        );
}

client.login(token);
