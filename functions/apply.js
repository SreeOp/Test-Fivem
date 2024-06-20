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
          {
            type: 1, // ActionRow
            components: [
              {
                type: 2, // TextInput
                customId: 'username',
                placeholder: 'Enter your username',
                min: 1,
                max: 32,
                required: true,
              },
              {
                type: 2, // TextInput
                customId: 'age',
                placeholder: 'Enter your age',
                min: 1,
                max: 3,
                required: true,
              },
              {
                type: 2, // TextInput
                customId: 'reason',
                placeholder: 'Reason for joining',
                min: 1,
                max: 100,
                required: true,
              },
              {
                type: 2, // TextInput
                customId: 'discordId',
                placeholder: 'Discord ID',
                min: 1,
                max: 32,
                required: true,
              },
              {
                type: 2, // TextInput
                customId: 'steamId',
                placeholder: 'Steam ID',
                min: 1,
                max: 32,
                required: true,
              },
              // Add more TextInput components as needed
              {
                type: 2, // TextInput
                customId: 'steamId',
                required: true, // Ensure each component has required set correctly
              },
            ],
          },
        ],
      });

      const filter = (i) => i.customId === 'username' || i.customId === 'age' || i.customId === 'reason' || i.customId === 'discordId' || i.customId === 'steamId';
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

      const applicationDetails = {};

      collector.on('collect', async (i) => {
        if (i.customId === 'submitApplication') {
          if (!applicationDetails.username || !applicationDetails.age || !applicationDetails.reason || !applicationDetails.discordId || !applicationDetails.steamId) {
            await interaction.followUp({ content: 'Please fill in all fields.', ephemeral: true });
            return;
          }

          // Process application submission here
          // Example: Send to a submission channel and notify the user
          await interaction.followUp({ content: 'Your application has been submitted!', ephemeral: true });
        } else {
          applicationDetails[i.customId] = i.values[0];
        }
      });
    }
  }
};
