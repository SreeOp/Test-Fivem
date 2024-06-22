const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async (interaction, applicationSubmissionChannelId) => {
    const characterName = interaction.fields.getTextInputValue('characterName');
    const characterGender = interaction.fields.getTextInputValue('characterGender');
    const realName = interaction.fields.getTextInputValue('realName');
    const age = interaction.fields.getTextInputValue('age');
    const roleplayExperience = interaction.fields.getTextInputValue('roleplayExperience');

    const embed = new EmbedBuilder()
        .setTitle('New Whitelist Application')
        .setDescription(`**Character Name:** ${characterName}\n**Character Gender:** ${characterGender}\n**Real Name:** ${realName}\n**Age:** ${age}\n**Roleplay Experience:** ${roleplayExperience} months\n**User ID:** ${interaction.user.id}`);

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('accept_application')
            .setLabel('Accept')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('pending_application')
            .setLabel('Pending')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('reject_application')
            .setLabel('Reject')
            .setStyle(ButtonStyle.Danger)
    );

    try {
        const submissionChannel = await interaction.client.channels.fetch(applicationSubmissionChannelId);
        if (submissionChannel) {
            console.log(`Sending application to submission channel ${applicationSubmissionChannelId}`);
            await submissionChannel.send({ embeds: [embed], components: [buttons] });
            await interaction.reply({ content: 'Your application has been submitted.', ephemeral: true });
        } else {
            console.log('Submission channel not found.');
            await interaction.reply({ content: 'Submission channel not found. Please contact an admin.', ephemeral: true });
        }
    } catch (error) {
        console.error('Failed to fetch submission channel:', error);
        await interaction.reply({ content: 'There was an error submitting your application. Please try again later.', ephemeral: true });
    }
};
