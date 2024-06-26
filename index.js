require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Routes, REST, TextInputBuilder, ModalBuilder, TextInputStyle, Collection } = require('discord.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const acceptedChannelId = process.env.ACCEPTED_CHANNEL_ID;
const pendingChannelId = process.env.PENDING_CHANNEL_ID;
const rejectedChannelId = process.env.REJECTED_CHANNEL_ID;

const applicationReviewChannelId = '1255162116126539786'; // Set your review channel ID here

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

let applicationChannelId = null;

const mongoClient = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let db;

mongoClient.connect(err => {
    if (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
    db = mongoClient.db('discordBotDB'); // Replace with your database name
    console.log('Connected to MongoDB');
});

client.once('ready', () => {
    console.log('Bot is online!');
});

// Initialize commands collection
client.commands = new Collection();

// Dynamically read command files from the commands folder
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: client.commands.map(command => command.data.toJSON()) },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error refreshing application (/) commands:', error);
    }
})();

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (command) {
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    } else if (interaction.isButton()) {
        if (interaction.customId === 'applyButton') {
            const modal = new ModalBuilder()
                .setCustomId('applicationModal')
                .setTitle('Whitelist Application');

            const characterNameInput = new TextInputBuilder()
                .setCustomId('characterName')
                .setLabel('Character Name')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const characterGenderInput = new TextInputBuilder()
                .setCustomId('characterGender')
                .setLabel('Character Gender')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const realNameInput = new TextInputBuilder()
                .setCustomId('realName')
                .setLabel('Real Name')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const ageInput = new TextInputBuilder()
                .setCustomId('age')
                .setLabel('Age')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const experienceInput = new TextInputBuilder()
                .setCustomId('experience')
                .setLabel('Roleplay Experience')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const row1 = new ActionRowBuilder().addComponents(characterNameInput);
            const row2 = new ActionRowBuilder().addComponents(characterGenderInput);
            const row3 = new ActionRowBuilder().addComponents(realNameInput);
            const row4 = new ActionRowBuilder().addComponents(ageInput);
            const row5 = new ActionRowBuilder().addComponents(experienceInput);

            modal.addComponents(row1, row2, row3, row4, row5);

            await interaction.showModal(modal);
        } else if (interaction.customId === 'acceptButton' || interaction.customId === 'pendingButton' || interaction.customId === 'rejectButton') {
            const userTag = interaction.message.embeds[0].description.split(' ')[2];
            const member = interaction.guild.members.cache.find(member => member.user.tag === userTag);

            if (member) {
                let embed;
                let roleID;
                let channelID;

                if (interaction.customId === 'acceptButton') {
                    embed = new EmbedBuilder()
                        .setTitle('Application Update')
                        .setDescription('Your application status: Accepted')
                        .setColor('#00ff00')
                        .setImage('https://media.discordapp.net/attachments/1056903195961610275/1254445277759148172/096ff227-e675-4307-a969-e2aac7a4c7ba-2.png?ex=667ad634&is=667984b4&hm=7cd86a2366c7c0b217ab3b83a21ad954c504a977f1fdc0d959912e0ef2346d90&=&format=webp&quality=lossless&width=544&height=192'); // Replace with your image URL
                    roleID = '1253347204601741342'; // Replace with your role ID for accepted applications
                    channelID = acceptedChannelId; // Channel ID for accepted applications
                } else if (interaction.customId === 'pendingButton') {
                    embed = new EmbedBuilder()
                        .setTitle('Application Update')
                        .setDescription('Your application status: Pending')
                        .setColor('#ffff00')
                        .setImage('https://media.discordapp.net/attachments/1056903195961610275/1254445277759148172/096ff227-e675-4307-a969-e2aac7a4c7ba-2.png?ex=667ad634&is=667984b4&hm=7cd86a2366c7c0b217ab3b83a21ad954c504a977f1fdc0d959912e0ef2346d90&=&format=webp&quality=lossless&width=544&height=192'); // Replace with your image URL
                    roleID = '1253347271718735882'; // Replace with your role ID for pending applications
                    channelID = pendingChannelId; // Channel ID for pending applications
                } else if (interaction.customId === 'rejectButton') {
                    embed = new EmbedBuilder()
                        .setTitle('Application Update')
                        .setDescription('Your application status: Rejected')
                        .setColor('#ff0000')
                        .setImage('https://media.discordapp.net/attachments/1056903195961610275/1254445277759148172/096ff227-e675-4307-a969-e2aac7a4c7ba-2.png?ex=667ad634&is=667984b4&hm=7cd86a2366c7c0b217ab3b83a21ad954c504a977f1fdc0d959912e0ef2346d90&=&format=webp&quality=lossless&width=544&height=192'); // Replace with your image URL
                    roleID = '1254774082445115432'; // Replace with your role ID for rejected applications
                    channelID = rejectedChannelId; // Channel ID for rejected applications
                }

                await member.roles.add(roleID);
                await member.send({ embeds: [embed] });

                const channel = client.channels.cache.get(channelID);
                if (channel) {
                    await channel.send({ content: `<@${member.user.id}>`, embeds: [embed] }); // Mention the user in the channel
                }
            }
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'applicationModal') {
            const characterName = interaction.fields.getTextInputValue('characterName');
            const characterGender = interaction.fields.getTextInputValue('characterGender');
            const realName = interaction.fields.getTextInputValue('realName');
            const age = interaction.fields.getTextInputValue('age');
            const experience = interaction.fields.getTextInputValue('experience');

            const embed = new EmbedBuilder()
                .setTitle('New Whitelist Application')
                .setDescription(`Application from ${interaction.user.tag}`)
                .setColor('#00ff00')
                .addFields(
                    { name: 'Character Name', value: characterName },
                    { name: 'Character Gender', value: characterGender },
                    { name: 'Real Name', value: realName },
                    { name: 'Age', value: age },
                    { name: 'Experience', value: experience }
                )
                .setImage('https://media.discordapp.net/attachments/1056903195961610275/1254445277759148172/096ff227-e675-4307-a969-e2aac7a4c7ba-2.png?ex=667ad634&is=667984b4&hm=7cd86a2366c7c0b217ab3b83a21ad954c504a977f1fdc0d959912e0ef2346d90&=&format=webp&quality=lossless&width=544&height=192'); // Replace with your image URL

            const acceptButton = new ButtonBuilder()
                .setCustomId('acceptButton')
                .setLabel('Accept')
                .setStyle(ButtonStyle.Success);

            const pendingButton = new ButtonBuilder()
                .setCustomId('pendingButton')
                .setLabel('Pending')
                .setStyle(ButtonStyle.Secondary);

            const rejectButton = new ButtonBuilder()
                .setCustomId('rejectButton')
                .setLabel('Reject')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(acceptButton, pendingButton, rejectButton);

            const applicationReviewChannel = client.channels.cache.get(applicationReviewChannelId);
            if (applicationReviewChannel) {
                await applicationReviewChannel.send({ embeds: [embed], components: [row] });
            }

            const collection = db.collection('applications');
            await collection.insertOne({
                userId: interaction.user.id,
                characterName,
                characterGender,
                realName,
                age,
                experience,
                status: 'pending'
            });

            await interaction.reply({ content: 'Your application has been submitted successfully!', ephemeral: true });
        }
    }
});

client.login(token);

// Health check endpoint
app.get('/', (req, res) => {
    res.send('Bot is running!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
