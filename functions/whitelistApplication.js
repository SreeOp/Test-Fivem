const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = async (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton() || interaction.customId !== 'apply_whitelist') return;

        await interaction.reply({ content: 'Please answer the following questions for your application:', ephemeral: true });

        const questions = [
            { name: 'name', prompt: 'What is your name?' },
            { name: 'age', prompt: 'How old are you?' },
            { name: 'rules', prompt: 'Have you read the rules? (Yes/No)' }
        ];

        let answers = {};

        for (const { name, prompt } of questions) {
            await interaction.followUp({ content: prompt, ephemeral: true });

            const filter = (response) => response.user.id === interaction.user.id;
            const response = await interaction.channel.awaitMessageComponent({ filter, time: 60000 });

            if (!response) {
                await interaction.followUp({ content: 'You did not respond in time. Please try again.', ephemeral: true });
                return;
            }

            answers[name] = response.customId; // Adjust this to collect the response properly
        }

        // After collecting all answers, you can process them (send to review channel, etc.)
        const reviewChannel = client.channels.cache.get('123456789012345678');
        if (!reviewChannel) return console.error('Review channel not found.');

        const applicationEmbed = new MessageEmbed()
            .setTitle('New Whitelist Application')
            .setDescription(`Application from ${interaction.user.tag}`)
            .addFields(
                { name: 'Name', value: answers.name },
                { name: 'Age', value: answers.age },
                { name: 'Read Rules', value: answers.rules }
            );

        await reviewChannel.send({ embeds: [applicationEmbed] });

        await interaction.followUp({ content: 'Application submitted successfully!', ephemeral: true });
    });
};
