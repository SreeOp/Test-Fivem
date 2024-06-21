const { MessageActionRow, MessageSelectMenu, MessageButton, MessageEmbed } = require('discord.js');

module.exports = async (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'apply_whitelist') {
            // Create and send initial message with select menu
            const initialMessage = await interaction.reply({
                content: 'Please answer the following questions for your application:',
                ephemeral: true,
                components: [
                    new MessageActionRow().addComponents(
                        new MessageSelectMenu()
                            .setCustomId('application_questions')
                            .setPlaceholder('Select an option')
                            .addOptions([
                                {
                                    label: 'Name',
                                    value: 'name',
                                },
                                {
                                    label: 'Age',
                                    value: 'age',
                                },
                                {
                                    label: 'Have you read the rules?',
                                    value: 'read_rules',
                                },
                            ])
                    ),
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setCustomId('submit_application')
                            .setLabel('Submit')
                            .setStyle('PRIMARY')
                    ),
                ],
            });

            // Handle select menu interaction to collect answers
            client.on('interactionCreate', async (interaction) => {
                if (!interaction.isSelectMenu() || interaction.customId !== 'application_questions') return;

                const answer = interaction.values[0];
                let question, response;

                switch (answer) {
                    case 'name':
                        question = 'What is your name?';
                        break;
                    case 'age':
                        question = 'How old are you?';
                        break;
                    case 'read_rules':
                        question = 'Have you read the rules? (Yes/No)';
                        break;
                    default:
                        return;
                }

                await interaction.reply({
                    content: question,
                    ephemeral: true,
                });

                // Collect response to the question
                const responseCollector = interaction.channel.createMessageCollector({
                    filter: (m) => m.author.id === interaction.user.id,
                    max: 1,
                    time: 60000,
                });

                responseCollector.on('collect', (m) => {
                    response = m.content;
                });

                responseCollector.on('end', async () => {
                    // Handle submission once all questions are answered
                    if (response) {
                        await interaction.followUp({
                            content: 'Your application has been submitted successfully!',
                            ephemeral: true,
                        });

                        // Process the application details (e.g., send to review channel)
                        const applicationChannel = client.channels.cache.get('123456789012345678'); // Replace with your application review channel ID
                        const applicationEmbed = new MessageEmbed()
                            .setTitle('New Whitelist Application')
                            .setDescription(`Application from ${interaction.user.tag}`)
                            .addFields(
                                { name: 'Name', value: response, inline: true },
                                { name: 'Age', value: response, inline: true }, // Example, replace with actual age
                                { name: 'Read Rules', value: response, inline: true }, // Example, replace with actual answer
                            );

                        await applicationChannel.send({ embeds: [applicationEmbed] });
                    } else {
                        await interaction.followUp({
                            content: 'Failed to submit application. Please try again.',
                            ephemeral: true,
                        });
                    }
                });
            });
        }
    });
};
