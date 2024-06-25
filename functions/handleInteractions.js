// functions/handleInteractions.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const sendApplicationUpdate = require('./sendApplicationUpdate');

module.exports = async function handleInteractions(client, interaction, applicationReviewChannelId, applicationChannelId, acceptedChannelId, pendingChannelId, rejectedChannelId) {
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;

        if (commandName === 'setapplication') {
            applicationChannelId = interaction.channel.id;
            await interaction.reply('This channel has been set for whitelist applications.');
            console.log(`Application channel set to ${applicationChannelId}`);
        } else if (commandName === 'postapplication' && applicationChannelId) {
            await interaction.deferReply({ ephemeral: true });

            const embed = new EmbedBuilder()
                .setTitle('Whitelist Application')
                .setDescription('Click the button below to apply for the whitelist.')
                .setColor('#00ff00');

            const applyButton = new ButtonBuilder()
                .setCustomId('applyButton')
                .setLabel('Apply')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder()
                .addComponents(applyButton);

            const channel = client.channels.cache.get(applicationChannelId);
            if (channel) {
                await channel.send({ embeds: [embed], components: [row] });
                await interaction.deleteReply();
            } else {
                await interaction.editReply('Application channel is not set.');
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

            await interaction.update({ components: [] }); // Clear existing buttons
            await interaction.showModal(modal);
        } else if (interaction.customId === 'acceptButton' || interaction.customId === 'pendingButton' || interaction.customId === 'rejectButton') {
            const userTag = interaction.message.embeds[0].description.split(' ')[2];
            const member = interaction.guild.members.cache.find(member => member.user.tag === userTag);

            if (member) {
                await sendApplicationUpdate(interaction, member, client, interaction.customId, acceptedChannelId, pendingChannelId, rejectedChannelId);
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
                .setDescription(`Submitted by: ${interaction.user.tag}`)
                .addFields(
                    { name: 'Character Name', value: characterName, inline: true },
                    { name: 'Character Gender', value: characterGender, inline: true },
                    { name: 'Real Name', value: realName, inline: true },
                    { name: 'Age', value: age, inline: true },
                    { name: 'Roleplay Experience', value: experience, inline: true }
                )
                .setColor('#00ff00');

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

            const row = new ActionRowBuilder()
                .addComponents(acceptButton, pendingButton, rejectButton);

            const channel = client.channels.cache.get(applicationReviewChannelId);
            if (channel) {
                await channel.send({ embeds: [embed], components: [row], content: `<@${interaction.user.id}>` });
            }

            await interaction.reply({ content: 'Application submitted successfully!', ephemeral: true });
        }
    }
};
