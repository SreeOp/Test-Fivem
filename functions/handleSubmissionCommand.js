module.exports = async (interaction, applicationSubmissionChannelId) => {
    const channel = interaction.options.getChannel('channel');
    if (channel) {
        applicationSubmissionChannelId = channel.id;
        await interaction.reply({ content: `Submission channel has been set to ${channel}`, ephemeral: true });
    } else {
        await interaction.reply({ content: 'Failed to find or access the specified channel.', ephemeral: true });
    }
};
