const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async (interaction, applicationChannelId) => {
    const channel = interaction.options.getChannel('channel');
    if (channel) {
        applicationChannelId = channel.id;
        const embed = new EmbedBuilder()
            .setTitle('Whitelist Application')
            .setDescription('Apply here for Whitelist\n\n🟢 **Interview:**\nWhitelist Interviews are available 24x7\n\n🟢 **Availability:**\nWe are usually always available between peak times - 06:00 PM to 08:00 PM.\n\n**NOTE:**\nCheck the rules before applying')
            .setImage('attachment://image.jpg');

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('apply_whitelist')
                .setLabel('Apply For Whitelist')
                .setStyle(ButtonStyle.Primary)
        );

        try {
            await channel.send({ embeds: [embed], components: [buttons] });
            await interaction.reply({ content: `Application form has been sent to ${channel}`, ephemeral: true });
        } catch (error) {
            console.error('Failed to send message to channel:', error);
            await interaction.reply({ content: 'Failed to send message to the specified channel.', ephemeral: true });
        }
    } else {
        await interaction.reply({ content: 'Failed to find or access the specified channel.', ephemeral: true });
    }
};
