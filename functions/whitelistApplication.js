// functions/whitelistApplication.js
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
    sendApplicationMessage: async (client, channelId) => {
        const embed = new MessageEmbed()
            .setTitle('FiveM Whitelist Application')
            .setDescription('Click the button below to start your application.')
            .setColor('#0099ff');

        const applyButton = new MessageButton()
            .setCustomId('apply_button')
            .setLabel('Apply Now')
            .setStyle('PRIMARY');

        const row = new MessageActionRow().addComponents(applyButton);

        try {
            const channel = await client.channels.fetch(channelId);
            if (channel.isText()) {
                const msg = await channel.send({ embeds: [embed], components: [row] });
                console.log(`Application message sent in ${channel.name}`);
            }
        } catch (error) {
            console.error('Error sending application message:', error);
        }
    },

    handleApplicationInteraction: async (interaction) => {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'apply_button') {
            try {
                const user = await interaction.user.fetch();
                const questionsEmbed = new MessageEmbed()
                    .setTitle('FiveM Whitelist Application Questions')
                    .setDescription('Please answer the following questions to proceed with your application.')
                    .setColor('#0099ff')
                    .addField('Question 1', 'What is your age?')
                    .addField('Question 2', 'Why do you want to join our FiveM server?')
                    .addField('Question 3', 'What experience do you have with roleplaying?');

                await user.send({ embeds: [questionsEmbed] });
                await interaction.reply({ content: 'Application questions sent to your DMs. Please check and answer them.', ephemeral: true });
            } catch (error) {
                console.error('Error sending application questions:', error);
                await interaction.reply({ content: 'Failed to send application questions. Please try again later.', ephemeral: true });
            }
        }
    }
};
