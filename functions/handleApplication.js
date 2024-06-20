const { EmbedBuilder } = require('discord.js');

module.exports = {
  handleApplicationDecision: async (interaction) => {
    const decision = interaction.customId;
    const applicantId = interaction.message.content.match(/<@(\d+)>/)[1];
    const applicant = await interaction.client.users.fetch(applicantId);

    if (!applicant) {
      return interaction.reply({ content: 'Applicant not found.', ephemeral: true });
    }

    let embed;
    if (decision === 'acceptButton') {
      embed = new EmbedBuilder()
        .setTitle('Application Accepted')
        .setDescription('Congratulations! Your whitelist application has been accepted.')
        .setColor(0x00FF00)
        .setTimestamp();
    } else if (decision === 'rejectButton') {
      embed = new EmbedBuilder()
        .setTitle('Application Rejected')
        .setDescription('We are sorry to inform you that your whitelist application has been rejected.')
        .setColor(0xFF0000)
        .setTimestamp();
    }

    try {
      await applicant.send({ embeds: [embed] });
      await interaction.reply({ content: `Application has been ${decision === 'acceptButton' ? 'accepted' : 'rejected'}.`, ephemeral: true });
    } catch (error) {
      console.error(`Could not send DM to ${applicant.tag}.`);
      await interaction.reply({ content: 'There was an error sending the DM.', ephemeral: true });
    }
  }
};
