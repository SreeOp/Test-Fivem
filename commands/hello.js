const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Replies with a hello message'),
    async execute(interaction) {
        await interaction.reply('Hello!');
    },
};
