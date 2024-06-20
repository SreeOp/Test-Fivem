// functions/whitelist.js
const { MessageEmbed } = require('discord.js');
const { MessageButton, MessageActionRow } = require('discord-buttons');

const APPLICATION_CHANNEL_ID = '1253323014003757189'; // Replace with your application channel ID

module.exports = {
  handleWhitelistApplication: async function (client, message) {
    if (message.channel.id !== APPLICATION_CHANNEL_ID) return;

    const embed = new MessageEmbed()
      .setTitle('Apply for Whitelist')
      .setDescription('Click the button below to apply for whitelist.')
      .setColor('#0099ff');

    const applyButton = new MessageButton()
      .setLabel('Apply Now')
      .setStyle('blurple')
      .setID('apply_button');

    const row = new MessageActionRow().addComponents(applyButton);

    const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });

    client.on('clickButton', async (button) => {
      if (button.id === 'apply_button' && button.message.id === sentMessage.id) {
        const dmChannel = await button.clicker.user.createDM();
        const responseEmbed = new MessageEmbed()
          .setTitle('Application Submitted')
          .setDescription('Your application has been submitted successfully.')
          .setColor('#00ff00');
        dmChannel.send({ embeds: [responseEmbed] });

        // Optionally, you can handle further processing of the application here
      }
    });
  },
};
