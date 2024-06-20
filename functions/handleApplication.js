const { EmbedBuilder } = require('discord.js');

module.exports = {
  handleApplicationDecision: async (interaction) => {
    const decision = interaction.customId;
    const applicantId = interaction.message.content.match(/<@(\d+)>/)[1];
    const applicant = await interaction.client.users.fetch(applicantId);
    const guild = interaction.guild;

    if (!applicant) {
      return interaction.reply({ content: 'Applicant not found.', ephemeral: true });
    }

    let embed;
    let roleId;
    if (decision === 'acceptButton') {
      embed = new EmbedBuilder()
        .setTitle('Application Accepted')
        .setDescription('Congratulations! Your whitelist application has been accepted.')
        .setColor(0x00FF00)
        .setTimestamp();
      roleId = process.env.WHITELISTED_ROLE_ID;
    } else if (decision === 'rejectButton') {
      embed = new EmbedBuilder()
        .setTitle('Application Rejected')
        .setDescription('We are sorry to inform you that your whitelist application has been rejected.')
        .setColor(0xFF0000)
        .setTimestamp();
    } else if (decision === 'pendingButton') {
      embed = new EmbedBuilder()
        .setTitle('Application Pending')
        .setDescription('Your whitelist application is currently pending. Please wait for further updates.')
        .setColor(0xFFFF00)
        .setTimestamp();
      roleId = process.env.PENDING_ROLE_ID;
    }

    try {
      await applicant.send({ embeds: [embed] });
      await interaction.reply({ content: `Application has been ${decision === 'acceptButton' ? 'accepted' : decision === 'rejectButton' ? 'rejected' : 'marked as pending'}.`, ephemeral: true });

      if (roleId) {
        const member = await guild.members.fetch(applicantId);
        const role = guild.roles.cache.get(roleId);
        if (role) {
          await member.roles.add(role);
        } else {
          console.error(`Role not found: ${roleId}`);
        }
      }
    } catch (error) {
      console.error(`Could not send DM to ${applicant.tag}.`);
      await interaction.reply({ content: 'There was an error sending the DM.', ephemeral: true });
    }
  }
};
