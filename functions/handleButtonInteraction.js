const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = async (interaction) => {
    if (interaction.customId === 'apply_whitelist') {
        const modal = new ModalBuilder()
            .setCustomId('whitelist_application')
            .setTitle('Whitelist Application');

        const characterName = new TextInputBuilder()
            .setCustomId('characterName')
            .setLabel('Character Name')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const characterGender = new TextInputBuilder()
            .setCustomId('characterGender')
            .setLabel('Character Gender')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const realName = new TextInputBuilder()
            .setCustomId('realName')
            .setLabel('Real Name')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const age = new TextInputBuilder()
            .setCustomId('age')
            .setLabel('Age')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const roleplayExperience = new TextInputBuilder()
            .setCustomId('roleplayExperience')
            .setLabel('Roleplay Experience (months)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(characterName),
            new ActionRowBuilder().addComponents(characterGender),
            new ActionRowBuilder().addComponents(realName),
            new ActionRowBuilder().addComponents(age),
            new ActionRowBuilder().addComponents(roleplayExperience)
        );

        await interaction.showModal(modal);
    } else {
        const userId = interaction.message.embeds[0].description.split('\n').pop().split(': ').pop();
        const user = await interaction.client.users.fetch(userId);

        if (interaction.customId === 'accept_application') {
            await user.send('Your application has been accepted!');
            const role = interaction.guild.roles.cache.find(role => role.name === 'Whitelisted');
            const member = interaction.guild.members.cache.get(user.id);
            if (member) {
                await member.roles.add(role);
            }
        } else if (interaction.customId === 'pending_application') {
            await user.send('Your application is pending.');
        } else if (interaction.customId === 'reject_application') {
            await user.send('Your application has been rejected.');
            const role = interaction.guild.roles.cache.find(role => role.name === 'Rejected');
            const member = interaction.guild.members.cache.get(user.id);
            if (member) {
                await member.roles.add(role);
            }
        }
        await interaction.reply({ content: 'Action has been taken on the application.', ephemeral: true });
    }
};
