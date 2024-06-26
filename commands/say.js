const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Repeats the message you provide.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to repeat')
                .setRequired(true)),
    async execute(interaction) {
        const message = interaction.options.getString('message');
        await interaction.reply({ content: message });
    },
};
