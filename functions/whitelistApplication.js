const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = async (client) => {
    client.on('ready', async () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'apply_whitelist') {
            await interaction.reply({ content: 'Please check your DMs for the application questions.', ephemeral: true });

            const questions = [
                'What is your name?',
                'How old are you?',
                'Have you read the rules? (yes/no)',
            ];

            const applicationDetails = [];

            const dmChannel = await interaction.user.createDM();
            let counter = 0;

            const askQuestion = async () => {
                if (counter < questions.length) {
                    await dmChannel.send(questions[counter]);
                }
            };

            const collector = dmChannel.createMessageCollector({ time: 60000 });

            askQuestion();

            collector.on('collect', (m) => {
                applicationDetails.push(m.content);
                counter++;
                if (counter < questions.length) {
                    askQuestion();
                } else {
                    collector.stop();
                }
            });

            collector.on('end', async () => {
                const applicationChannel = client.channels.cache.get('1253323112972550185'); // Application review channel ID
                if (!applicationChannel) return console.error('Application review channel not found.');

                const applicationEmbed = new EmbedBuilder()
                    .setTitle('New Whitelist Application')
                    .setDescription(`Application from ${interaction.user.tag}`)
                    .addFields(
                        { name: 'Name', value: applicationDetails[0] },
                        { name: 'Age', value: applicationDetails[1] },
                        { name: 'Read Rules', value: applicationDetails[2] }
                    );

                const actionRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('accept_application')
                            .setLabel('Accept')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('pending_application')
                            .setLabel('Pending')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('reject_application')
                            .setLabel('Reject')
                            .setStyle(ButtonStyle.Danger),
                    );

                await applicationChannel.send({ embeds: [applicationEmbed], components: [actionRow] });
            });
        }

        if (['accept_application', 'pending_application', 'reject_application'].includes(interaction.customId)) {
            const userId = interaction.message.embeds[0].description.split(' ')[2];
            const user = await client.users.fetch(userId).catch(console.error);
            if (!user) return;

            let dmMessage;
            let role;

            switch (interaction.customId) {
                case 'accept_application':
                    dmMessage = 'Your application has been accepted!';
                    role = '1253347204601741342'; // Accepted role ID (update with your role ID)
                    break;
                case 'pending_application':
                    dmMessage = 'Your application is pending review.';
                    role = '1253347271718735882'; // Pending role ID (update with your role ID)
                    break;
                case 'reject_application':
                    dmMessage = 'Your application has been rejected.';
                    role = null;
                    break;
            }

            await user.send(dmMessage).catch(console.error);

            if (role) {
                const guild = client.guilds.cache.get('754291343551102976'); // Replace with your Guild ID
                if (!guild) return console.error('Guild not found.');
                const member = await guild.members.fetch(userId).catch(console.error);
                if (!member) return console.error('Member not found.');
                await member.roles.add(role).catch(console.error);
            }

            await interaction.update({ content: `Application ${interaction.customId.replace('_application', '')}`, components: [] });
        }
    });
};
