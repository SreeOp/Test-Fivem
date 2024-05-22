const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'pay',
  description: 'Uploading Payment Scanner',
  execute(message, args) {
    const pingEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Gpay')
      .setDescription('Uploading Payment Scanner')
      .setTimestamp();

    message.reply({ embeds: [pingEmbed] }).then(sentMessage => {
      const ping = sentMessage.createdTimestamp - message.createdTimestamp;

      const updatedPingEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Payment Method')
        .setDescription(`Google Pay`)
        .setImage(`https://cdn.discordapp.com/attachments/1168317399892774942/1227660104854147285/GooglePay_QR_1.png?ex=664ec951&is=664d77d1&hm=38fa1ea8b4a1c65a84b73c4c71f880646fdff24af2db89b02bd72431dbeae7b3&`)
        .setTimestamp();

      sentMessage.edit({ embeds: [updatedPingEmbed] });
    });
  },
};
