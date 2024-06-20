const Discord = require('discord.js');
const client = new Discord.Client();
const { token, guildId, applicationChannelId, reviewChannelId } = require('./config.json'); // Make sure to create a config.json file

client.once('ready', () => {
    console.log('Bot is ready!');
});

client.on('message', async message => {
    if (message.content.toLowerCase() === '!apply') {
        // Replace with your application embed
        const embed = new Discord.MessageEmbed()
            .setTitle('Whitelist Application')
            .setDescription('Click the button below to apply for whitelist.')
            .setColor('#00ff00');

        const applicationChannel = client.channels.cache.get(applicationChannelId);
        if (!applicationChannel || applicationChannel.type !== 'text') return message.channel.send('Application channel not found.');

        const sentMessage = await applicationChannel.send({ embeds: [embed], components: [getApplyButton()] });

        // Listen for interaction
        client.on('interactionCreate', async interaction => {
            if (!interaction.isButton()) return;

            if (interaction.customId === 'apply') {
                const user = interaction.user;
                // DM the user about their application
                try {
                    await user.send('Your application has been submitted successfully.');
                } catch (error) {
                    console.error('Could not send DM to user.');
                }
                
                // Move application to review channel
                const reviewChannel = client.channels.cache.get(reviewChannelId);
                if (reviewChannel && reviewChannel.type === 'text') {
                    const reviewEmbed = new Discord.MessageEmbed()
                        .setTitle('New Whitelist Application')
                        .setDescription('Review and decide on this application.')
                        .setColor('#ffcc00')
                        .addField('Applicant', user.tag);

                    const reviewMessage = await reviewChannel.send({ embeds: [reviewEmbed], components: getReviewButtons(user) });
                    sentMessage.delete(); // Delete the original application message
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
