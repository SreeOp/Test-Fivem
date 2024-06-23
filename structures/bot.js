require('dotenv').config();
require("./handlers/keepAlive")();
const config = require('./botconfig/config.json');
const ee = require('./botconfig/embed.json');
const {
    Client,
    Intents,
} = require("discord.js");
const colors = require("colors");
const Enmap = require("enmap");
const libsodium = require("libsodium-wrappers");

const client = new Client({
    fetchAllMembers: false,
    // restTimeOffset: 0,
    shards: 'auto',
    allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: false,
    },
    partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"],
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_WEBHOOKS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING
    ],
    presence: {
        activities: [{
            name: `ZX STORE`,
            type: "WATCHING",
        },
        {
            name: `MEMBERS`,
            type: "WATCHING",
        },
        {
             name: `CW SERVERS`,
             type: "WATCHING",
        },
        {
              name: `CW SERVERS`,
              type: "WATCHING",
        },
        {
            name: `NEW RESOURCES`,
            type: "WATCHING",
        }],
        status: "dnd"
    }
});

client.setMaxListeners(0);
require('events').defaultMaxListeners = 0;

["extraEvents", "clientVariables", "antiCrash", "eventHandler", "commandHandler", "slashCommandHandler", "enmapDB", "mongoDBHandler"].forEach((handler) => {
    require(`./handlers/${handler}`)(client);
});

client.login(config.env.TOKEN || process.env.TOKEN);







const { MessageActionRow, MessageButton } = require('discord.js');
const { handleButtonInteraction } = require('./reactionRole');


// Define constants for roleId and channelId
const roleId = '1167156819412660274';
const channelId = '1188156219173638187';

// Event: Message Create
client.on('messageCreate', async (message) => {
  if (message.channel.id === channelId && message.content.toLowerCase() === '!setupcwverify') {
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('verify')
          .setLabel('Verify✅')
          .setStyle('SUCCESS')
      );

    const welcomeEmbed = {
      title: 'Welcome to ZX STORE!',
      description: 'Before you can access all the channels, please take a moment to read our server rules. Once you\'ve read the rules, click the "`Verify`" button below to gain the Verified role.\n-----------------------------------------------------\nThank you for your cooperation, and enjoy your time in the server!',
      color: 14485196,
      author: {
        name: 'ZX STORE',
        icon_url: 'https://cdn.discordapp.com/attachments/1135964320883290205/1189549216788389938/hdzx.gif',
      },
      footer: {
        text: 'powered by CW',
        icon_url: 'https://media.discordapp.net/attachments/958054602622779473/1188930713823760435/CW.png',
      },
      timestamp: '2023-12-24T18:30:00.000Z',
      image: {
        url: 'https://cdn.discordapp.com/attachments/1047948042285895680/1189939918009544874/ezgif.com-video-to-gif-converter_5.gif',
      },
      thumbnail: {
        url: 'https://cdn.discordapp.com/attachments/1135964320883290205/1189549216788389938/hdzx.gif',
      },
    };

    await message.channel.send({ content: '@everyone', components: [row], embeds: [welcomeEmbed] });
  }
  
  else if (message.content.toLowerCase() === '!review') {
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('review')
          .setLabel('FEEDBACK')
          .setStyle('PRIMARY') // Update the style if needed
      );

    await message.channel.send({ content: 'Click the button to post a feedback', components: [row]});
  }

  else if (message.content.toLowerCase() === '!addrole') {
    const role = message.guild.roles.cache.get(`1167156819412660274`);
    const guild = message.guild;
    guild.members.cache.forEach(async (member) => {
      try {
        await member.roles.add(role);
        console.log(`Added role to ${member.user.tag}`);
      } catch (error) {
        console.error(`Error adding role to ${member.user.tag}: ${error.message}`);
        await message.channel.send(`Error adding role to ${member.user.tag}: ${error.message}`);
      }
    });
  }
});









/**********************************************************
 * @INFO
 * Bot Coded by Zedro#2742 | https://discord.gg/milanio
 * @INFO
 * Work for Milanio Development | https://discord.gg/milanio
 * @INFO
 * Please Mention Us Milanio Development, When Using This Code!
 * @INFO
 *********************************************************/




// Event: Interaction Create
client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    await handleButtonInteraction(interaction, roleId);
  }
});