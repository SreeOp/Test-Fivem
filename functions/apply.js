const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  sendApplicationEmbed: async (client) => {
    const embed = new EmbedBuilder()
      .setTitle('Whitelist Application')
      .setDescription('Click the button below to apply for the whitelist.')
      .setColor(0x00FF00);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('applyButton')
        .setLabel('Apply')
        .setStyle(ButtonStyle.Primary)
    );

    const applicationChannel = client.channels.cache.get(process.env.APPLICATION_CHANNEL_ID);
    if (applicationChannel) {
      await applicationChannel.send({ embeds: [embed], components: [row] });
    } else {
      console.error('Application channel not found.');
    }
  },

  handleApplicationButton: async (interaction) => {
    if (interaction.customId === 'applyButton') {
      await interaction.reply({
        content: 'Please provide the following details:',
        ephemeral: true,
        components: [
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('username')
              .setLabel('Username')
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
            new TextInputBuilder()
              .setCustomId('age')
              .setLabel('Age')
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
            new TextInputBuilder()
              .setCustomId('reason')
              .setLabel('Reason for joining')
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true)
          )
        ]
      });

      const filter = (i) => i.customId === 'username' || i.customId === 'age' || i.customId === 'reason';
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

      const applicationDetails = {};

      collector.on('collect', async (i) => {
        applicationDetails[i.customId] = i.values[0];
        if (Object.keys(applicationDetails).length === 3) {
          collector.stop();
          const submittedApplicationChannel = interaction.client.channels.cache.get(process.env.SUBMITTED_APPLICATION_CHANNEL_ID);
          if (submittedApplicationChannel) {
            const embed = new EmbedBuilder()
              .setTitle('New Whitelist Application')
              .setColor(0x00FF00)
              .addFields(
                { name: 'Username', value: applicationDetails.username },
                { name: 'Age', value: applicationDetails.age },
                { name: 'Reason', value: applicationDetails.reason },
              )
              .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('acceptButton')
                .setLabel('Accept')
                .setStyle(ButtonStyle.Success),
              new ButtonBuilder()
                .setCustomId('rejectButton')
                .setLabel('Reject')
                .setStyle(ButtonStyle.Danger),
              new ButtonBuilder()
                .setCustomId('pendingButton')
                .setLabel('Pending')
                .setStyle(ButtonStyle.Secondary)
            );

            await submittedApplicationChannel.send({ embeds: [embed], components: [row], content: `<@${interaction.user.id}>` });
            await interaction.followUp({ content: 'Your application has been submitted!', ephemeral: true });
          } else {
            await interaction.followUp({ content: 'Error: Submitted application channel not found.', ephemeral: true });
          }
        }
      });
    }
  }
};
