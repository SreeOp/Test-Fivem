const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = async (client) => {
    // Event listener for when bot is ready
    client.on('ready', async () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });

    // Event listener for interactions (e.g., button clicks)
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'apply_whitelist') {
            await interaction.reply({ content: 'Please answer the following questions for your application:', ephemeral: true });

            // Collect application details
            const applicationDetails = {};
            const questions = ['Name', 'Age', 'Have you read the rules? (yes/no)']; // Adjust questions as needed

            for (const question of questions) {
                await interaction.followUp({ content: question, ephemeral: true });

                const filter = (m) => m.author.id === interaction.user.id;
                const response = await interaction.channel.awaitMessageComponent({ filter, time: 60000 });

                if (!response) {
                    await interaction.followUp({ content: 'Application timed out. Please try again.', ephemeral: true });
                    return;
                }

                applicationDetails[question] = response.customId || response.content;
            }

            // Send application details to review channel
            const applicationChannel = client.channels.cache.get('123456789012345678'); // Replace with your application review channel ID
            if (!applicationChannel) return console.error('Application channel not found.');

            const applicationEmbed = new MessageEmbed()
                .setTitle('New Whitelist Application')
                .setDescription(`Application from ${interaction.user.tag}`)
                .addFields(
                    { name: 'Name', value: applicationDetails['Name'] },
                    { name: 'Age', value: applicationDetails['Age'] },
                    { name: 'Read Rules', value: applicationDetails['Have you read the rules? (yes/no)'] },
                );

            const actionRow = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('accept_application')
                        .setLabel('Accept')
                        .setStyle('SUCCESS'),
                    new MessageButton()
                        .setCustomId('pending_application')
                        .setLabel('Pending')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('reject_application')
                        .setLabel('Reject')
                        .setStyle('DANGER'),
                );

            await applicationChannel.send({ embeds: [applicationEmbed], components: [actionRow] });
        }

        if (['accept_application', 'pending_application', 'reject_application'].includes(interaction.customId)) {
            const userId = interaction.message.embeds[0].description.split(' ')[2].slice(2, -1); // Extract user ID from embed description

            if (!userId) {
                await interaction.reply({ content: 'Unable to fetch user information. Please try again later.', ephemeral: true });
                return;
            }

            const user = await client.users.fetch(userId);

            if (!user) {
                await interaction.reply({ content: 'User not found. Please try again later.', ephemeral: true });
                return;
            }

            let dmMessage;
            let role;

            switch (interaction.customId) {
                case 'accept_application':
                    dmMessage = 'Your application has been accepted!';
                    role = '123456789012345678'; // Replace with your role ID for accepted applications
                    break;
                case 'pending_application':
                    dmMessage = 'Your application is pending review.';
                    role = null; // No role change for pending applications
                    break;
                case 'reject_application':
                    dmMessage = 'Your application has been rejected.';
                    role = null; // No role change for rejected applications
                    break;
                default:
                    return;
            }

            await user.send(dmMessage);

            if (role) {
                const guild = client.guilds.cache.get('123456789012345678'); // Replace with your guild ID
                if (!guild) {
                    await interaction.reply({ content: 'Guild not found. Please try again later.', ephemeral: true });
                    return;
                }

                const member = await guild.members.fetch(userId);
                if (!member) {
                    await interaction.reply({ content: 'Member not found. Please try again later.', ephemeral: true });
                    return;
                }

                await member.roles.add(role);
            }

            await interaction.update({ content: `Application ${interaction.customId.replace('_application', '')} for ${user.username} processed.`, components: [] });
        }
    });
};
