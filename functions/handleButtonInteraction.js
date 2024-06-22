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
    }
};
