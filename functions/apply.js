const { ButtonBuilder, ButtonStyle } = require('@discordjs/builders');

module.exports = {
  handleApplicationButton: async (interaction) => {
    if (interaction.customId === 'applyButton') {
      // Define the buttons
      const acceptButton = new ButtonBuilder()
        .setCustomId('acceptButton')
        .setLabel('Accept')
        .setStyle(ButtonStyle.SUCCESS); // Adjust style as needed

      const rejectButton = new ButtonBuilder()
        .setCustomId('rejectButton')
        .setLabel('Reject')
        .setStyle(ButtonStyle.DANGER); // Adjust style as needed

      // Reply with buttons
      await interaction.reply({
        content: 'Application received. What would you like to do with it?',
        ephemeral: true,
        components: [
          {
            type: 1, // ActionRow
            components: [acceptButton, rejectButton],
          },
        ],
      });
    }
  },
};
