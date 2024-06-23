const { Client, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
  name: 'addstore',
  description: 'Add an item to the store',
  options: [
    {
      name: 'channel',
      description: 'The channel where you want to add the item.',
      type: 'CHANNEL',
      required: true,
    },
    {
      name: 'title',
      description: 'The title of the product.',
      type: 'STRING',
      required: true,
    },
    {
      name: 'description',
      description: 'A brief description of the product.',
      type: 'STRING',
      required: true,
    },
    {
      name: 'image_url',
      description: 'URL of the image representing the product (optional).',
      type: 'STRING',
      required: true,
    },
    {
      name: 'download_url',
      description: 'URL for downloading the product (optional).',
      type: 'STRING',
      required: true,
    },
    {
      name: 'video_url',
      description: 'URL linking to a video showcasing the product (optional).',
      type: 'STRING',
      required: true,
    },
  ],
  cooldown: 0,
  userPermissions: "",
  botPermissions: "",
  ownerOnly: false,
  toggleOff: false,

  /**
   * @param {Client} client 
   * @param {CommandInteraction} interaction
   * @param {Object} ee
   */
  async execute(client, interaction, ee) {
    try {
      // Access input options
      const channel = interaction.options.getChannel('channel');
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const image_url = interaction.options.getString('image_url') || 'https://media.discordapp.net/attachments/1047948042285895680/1189285777272733796/20231129_192000.png';
      const download_url = interaction.options.getString('download_url');
      const video_url = interaction.options.getString('video_url');

      // Create an embed
      const embed = {
        color: 0x71368a,
        title: title,
        description: description,
        image: { url: image_url }, // Include image with a default URL
        thumbnail: { url: interaction.guild.iconURL({ dynamic: true }) },
        timestamp: new Date(), // Corrected syntax for timestamp
        footer: { text: 'ZX STORE | powered by CW', iconURL: interaction.guild.iconURL({ dynamic: true }) }
      };

      // Create buttons if download_url or video_url is provided
      const buttons = new MessageActionRow();
      
      if (download_url) {
        buttons.addComponents(
          new MessageButton()
            .setLabel('Download')
            .setURL(download_url)
            .setStyle('LINK')
        );
      }

      if (video_url) {
        buttons.addComponents(
          new MessageButton()
            .setLabel('Watch Video')
            .setURL(video_url)
            .setStyle('LINK')
        );
      }


      // Send the embed with buttons to the specified channel
      await channel.send({ embeds: [embed], components: [buttons]  });

      // Respond to the interaction
      await interaction.reply('Item added to the store successfully!');
    } catch (err) {
      console.error(err);
    }
  }
};
