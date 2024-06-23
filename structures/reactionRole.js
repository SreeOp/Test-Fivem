const { MessageActionRow, MessageButton, MessageActionRowComponentTypes } = require('discord.js');

module.exports = {
  setupButton: () => {
    const button = new MessageButton()
      .setCustomId('verify')
      .setLabel('Get Verified')
      .setStyle('SUCCESS');

    const row = new MessageActionRow().addComponents(button);

    return row;
  },

  handleButtonInteraction: async (interaction, roleId) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'verify') {
      const member = interaction.member;
      const role = interaction.guild.roles.cache.get(`1167156819412660274`);

      if (member && role) {
        await member.roles.add(role);
        await interaction.reply({ content: 'WELCOME TO ZX STORE', ephemeral: true });
      } else {
        await interaction.reply({ content: 'Error assigning role!', ephemeral: true });
      }
    }
    
    if (interaction.customId === 'review') {
      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('submitReview')
            .setLabel('Submit Review')
            .setStyle('PRIMARY'),
          new MessageButton()
            .setCustomId('cancelReview')
            .setLabel('Cancel')
            .setStyle('DANGER')
        );

      await interaction.reply({
        content: 'Please enter your review:',
        components: [row],
      });
    }
    
  },
};
