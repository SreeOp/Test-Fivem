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
              {
                type: 2, // TextInput
                customId: 'steamId',
                required: true,
              }
              {
                Icon: Define Status Bar Provides The Marketplace Shopify App We Creative Market
