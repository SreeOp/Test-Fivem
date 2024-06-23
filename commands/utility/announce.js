const config = require(`${process.cwd()}/structures/botconfig/config.json`);
const {
  Client,
  Message,
  MessageEmbed
} = require('discord.js');
// ${gifArray[Math.floor(Math.random() * gifArray.length)]}
var gifArray = [
  `https://media.discordapp.net/attachments/877859563016159252/879664980218249216/colour_line2.gif`,
  `https://media.discordapp.net/attachments/784318977005453312/784319451427373096/source-2.gif`,
  `https://media1.tenor.com/images/bf37e8dded18aaa840331bb87f99d3a9/tenor.gif`,
  `https://media.discordapp.net/attachments/856477786302578689/861804548296933376/image0.gif`,
  `https://cdn.discordapp.com/attachments/885763246185930802/886560080051466280/ww.gif`,
  `https://media.discordapp.net/attachments/702831042276491345/803723873988116580/x.gif`,
  `https://media.discordapp.net/attachments/702831042276491345/803725715605946368/sv.gif`,
];


module.exports = {
  name: "announce",
  aliases: ['ann'],
  description: "Announce Command",
  cooldown: 0,
  category: "utility",
  userPermissions: "MANAGE_MESSAGES",
  botPermissions: "MANAGE_MESSAGES",

  async execute(client, message, args, ee) {
    try {
      message.delete();
      const log = client.channels.cache.get('1189201937393000499');
      let Content = args.join(" ");
      await log.send(`**${message.author.tag}** Used \`announce\` command | content: ${Content}`)
      if (!Content)
        return message.reply({ embeds:[new MessageEmbed()
          .setColor(ee.color)
          .setFooter(ee.footertext, ee.footericon)
          .setDescription(`Please Give Me Something To Announce!`)]});

      return message.channel.send({ embeds:[new MessageEmbed()
        .setColor(`0x71368a`)
        .setTitle(`__ANNOUNCEMENT__`)
        .setThumbnail(message.guild.iconURL({
          dynamic: true
        }))
        .setFooter({ text: `Announced By ${message.author.username} | powered by CW`, iconURL: message.guild.iconURL({ dynamic: true }) })
        .setTimestamp()
        .setImage(`https://cdn.discordapp.com/attachments/1047948042285895680/1189939918009544874/ezgif.com-video-to-gif-converter_5.gif`)
        .setDescription(`${Content}`)]});
    } catch (e) {
      console.log(String(e.stack).bgRed)
    }
  }
}; 